import BeverageOrderItem from "../models/order/beverage-order-item-model.js";
import FoodOrderItem from "../models/order/food-order-item-model.js";
import Order from "../models/order/order-model.js";
import OrderToken from "../models/order/order-token-model.js";
import RestaurantTable from "../models/order/restaurant-table-model.js";
import { OrderStatuses, ServiceTypes, TableStatuses } from "../utils/enums/order-related-enums.js";
import { generateOrderNumber, generateTokenId } from "../utils/order-util.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response-util.js";
import mongoose from "mongoose";

export const setInitialOrderDetails = async (req, res) => {
    try{
        const {customerType, serviceType, roomNumber, guestName } = req.body;

        const orderStatus = OrderStatuses.SET_INITIAL_ORDER_DATA.value;

        const orderNumber = await generateOrderNumber();

        const newOrder = await Order.create({
            orderNumber,
            customerType,
            serviceType,
            roomNumber,
            guestName,
            orderStatus
        });

        sendSuccessResponse(res,201, "Successfully set order initial data", {order:newOrder});
    }catch(error){
        sendErrorResponse(res,500,"Internal Server Error", error.message);
    }
};

export const addTable = async (req, res) => {
  try {
    const { name, tableNumber, status } = req.body;

    if (!name || !tableNumber || !status) {
      return sendErrorResponse(res, 400, "Name and table number are required");
    }

    const existTable = await RestaurantTable.findOne({name, tableNumber});

    if (existTable) {
      return sendErrorResponse(res, 400, "Already existed table" );
    }

    const table = await RestaurantTable.create({ name, tableNumber, status });

    return sendSuccessResponse(res, 201, "Table added successfully", { table });
  } catch (error) {
    console.error("Error adding table:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Could contain name, tableNumber, isSelected, etc.

    if (Object.keys(updateData).length === 0) {
      return sendErrorResponse(res, 400, "At least one field is required to update");
    }

    // Check if table exists
    const table = await RestaurantTable.findById(id);
    if (!table) {
      return sendErrorResponse(res, 404, "Table not found");
    }

    // Optional: Check for duplicate if name or tableNumber is being updated
    if (updateData.name || updateData.tableNumber) {
      const existTable = await RestaurantTable.findOne({
        name: updateData.name || table.name,
        tableNumber: updateData.tableNumber || table.tableNumber,
        _id: { $ne: id },
      });
      if (existTable) {
        return sendErrorResponse(res, 400, "A table with the same name and number already exists");
      }
    }

    // Update table dynamically
    Object.keys(updateData).forEach((key) => {
      table[key] = updateData[key];
    });

    await table.save();

    return sendSuccessResponse(res, 200, "Table updated successfully", { table });
  } catch (error) {
    console.error("Error updating table:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const getAllTables = async (req, res) => {
  try {
    const tables = await RestaurantTable.find().sort({ tableNumber: 1 }); // Sorted by table number (optional)

    if (!tables || tables.length === 0) {
      return sendSuccessResponse(res, 200, "No tables found", { tables: [] });
    }

    return sendSuccessResponse(res, 200, "Tables fetched successfully", { tables });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await RestaurantTable.findById(id);

    if (!table) {
      return sendErrorResponse(res, 404, "Table not found");
    }

    return sendSuccessResponse(res, 200, "Table fetched successfully", { table });
  } catch (error) {
    console.error("Error fetching table:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};


export const selectTableForOrder = async (req, res) => {
  try {
    const { id } = req.params; // order ID
    const { tableId } = req.body; // new table ID

    // find the order first
    const order = await Order.findById(id);

    if (!order) {
      return sendErrorResponse(res, 404, "Order not found");
    }
    // Check order type before assigning table
    if (order.serviceType !== ServiceTypes.DINE_IN.value) {
      return sendErrorResponse(
        res,
        400,
        "A table can only be selected for dine-in orders"
      );
    }

    // Allow selecting a table only if the order is in the "SET_INITIAL_ORDER_DATA" status
    if (order.orderStatus !== OrderStatuses.SET_INITIAL_ORDER_DATA.value) {
      return sendErrorResponse(
        res,
        400,
        "A table can only be selected when the order is in the initial state"
      );
    }

    // Check if the table is already assigned to another active order
    const existingOrderWithTable = await Order.findOne({
      restaurantTable: tableId,
      orderStatus: { $ne: OrderStatuses.CLOSED.value }, // table is free only if previous order is completed
    });

    if (existingOrderWithTable) {
      return sendErrorResponse(
        res,
        400,
        "This table is already assigned to another active order"
      );
    }

    await RestaurantTable.findByIdAndUpdate(tableId, { status: TableStatuses.RESERVED.value});

    // Assign the table
    order.restaurantTable = tableId;
    await order.save();

    sendSuccessResponse(res, 200, "Table assigned to order successfully", {
      updatedOrder: order,
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const addOrderToken = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // order id
    const { tokenNumber, foodOrders, beverageOrders, tokenSubTotal, tokenTax, tokenDiscounts, tokenTotalBill } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return sendErrorResponse(res, 404, "Order not found");
    }

    const foodOrderIds = [];
    const beverageOrderIds = [];

    // create food items
    if (foodOrders?.length) {
      for (const food of foodOrders) {
        const foodItem = new FoodOrderItem(food);
        await foodItem.save({ session });
        foodOrderIds.push(foodItem._id);
      }
    }

    // create beverage items
    if (beverageOrders?.length) {
      for (const bev of beverageOrders) {
        const bevItem = new BeverageOrderItem(bev);
        await bevItem.save({ session });
        beverageOrderIds.push(bevItem._id);
      }
    }

    // generate tokenId using orderNumber
    const tokenId = generateTokenId(order.orderNumber);

    // create token
    const orderToken = new OrderToken({
      tokenId,
      tokenNumber,
      foodOrders: foodOrderIds,
      beverageOrders: beverageOrderIds,
      tokenSubTotal,
      tokenTax,
      tokenDiscounts,
      tokenTotalBill,
    });

    await orderToken.save({ session });

    // attach token to order
    order.orderTokens.push(orderToken._id);
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    sendSuccessResponse(res, 201, "Order token added successfully", { orderToken });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (avoids unnecessary DB queries if invalid)
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid order ID format");
    }

    const order = await Order.findById(id)
      .populate("restaurantTable"); // populate table details

    if (!order) {
      return sendErrorResponse(res, 404, "Order not found");
    }

    return sendSuccessResponse(
      res,
      200,
      "Order details retrieved successfully",
      { order }
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};






