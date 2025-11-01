import BeverageOrderItem from "../models/order/beverage-order-item-model.js";
import FoodOrderItem from "../models/order/food-order-item-model.js";
import Order from "../models/order/order-model.js";
import OrderToken from "../models/order/order-token-model.js";
import RestaurantTable from "../models/order/restaurant-table-model.js";
import { OrderStatuses, PaymentMethods, ServiceTypes, TableStatuses } from "../utils/enums/order-related-enums.js";
import { generateOrderNumber, generateTokenId } from "../utils/order-util.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response-util.js";
import mongoose from "mongoose";
import { getRestaurantTypeByUserRole } from "../utils/user-util.js";

export const setInitialOrderDetails = async (req, res) => {
    try{
        const {customerType, serviceType, roomNumber, guestName, guestId, bookingId } = req.body;

        const { userId } = req.user;

        const orderStatus = OrderStatuses.SET_INITIAL_ORDER_DATA.value;

        const orderNumber = await generateOrderNumber();

        const restaurantType = await getRestaurantTypeByUserRole(userId);

        const newOrder = await Order.create({
            orderNumber,
            customerType,
            serviceType,
            restaurantType,
            roomNumber,
            guestId,
            guestName,
            orderStatus,
            bookingId
        });

        sendSuccessResponse(res,201, "Successfully set order initial data", {order:newOrder});
    }catch(error){
        sendErrorResponse(res,500,"Internal Server Error", error.message);
    }
};

export const addTable = async (req, res) => {
  try {
    const { name, tableNumber, status, restaurantType } = req.body;

    if (!name || !tableNumber || !status) {
      return sendErrorResponse(res, 400, "Name and table number are required");
    }

    const existTable = await RestaurantTable.findOne({name, tableNumber, restaurantType});

    if (existTable) {
      return sendErrorResponse(res, 400, "Already existed table" );
    }

    const table = await RestaurantTable.create({ name, tableNumber, status, restaurantType });

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
    const { userId } = req.user;

    const restaurantType = await getRestaurantTypeByUserRole(userId);

    const tables = await RestaurantTable.find({restaurantType}).sort({ tableNumber: 1 }); // Sorted by table number (optional)

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
      orderStatus: { $ne: OrderStatuses.COMPLETED.value }, // table is free only if previous order is completed
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
    const { newOrderToken, subTotal, tax, discount, serviceCharge, totalBill } =
      req.body.data;
    const order = await Order.findById(id);
    if (!order) {
      await session.abortTransaction();
      return sendErrorResponse(res, 404, "Order not found");
    }

    let orderToken;

    // Updating an existing token
    if (newOrderToken._id) {
      orderToken = await OrderToken.findById(newOrderToken._id);
      if (!orderToken) {
        await session.abortTransaction();
        return sendErrorResponse(res, 404, "Order token not found");
      }

      const foodOrderIds = [];
      if (newOrderToken.foodOrders?.length) {
        for (const food of newOrderToken.foodOrders) {
          const { _id, ...foodData } = food; // strip old _id
          const foodItem = new FoodOrderItem(foodData);
          await foodItem.save({ session });
          foodOrderIds.push(foodItem._id);
        }
      }

      const beverageOrderIds = [];
      if (newOrderToken.beverageOrders?.length) {
        for (const beverage of newOrderToken.beverageOrders) {
          const { _id, ...foodData } = beverage; // strip old _id
          const beverageItem = new BeverageOrderItem(foodData);
          await beverageItem.save({ session });
          beverageOrderIds.push(beverageItem._id);
        }
      }

      orderToken.foodOrders = foodOrderIds;
      orderToken.beverageOrders = beverageOrderIds;
      orderToken.isPrinted = newOrderToken.isPrinted;
      orderToken.tokenSubTotal = newOrderToken.tokenSubTotal;
      orderToken.tokenTax = newOrderToken.tokenTax;
      orderToken.tokenDiscount = newOrderToken.tokenDiscount;
      orderToken.tokenServiceCharge = newOrderToken.tokenServiceCharge;
      orderToken.tokenTotalBill = newOrderToken.tokenTotalBill;

      await orderToken.save({ session });

      if (newOrderToken.isPrinted) {
        if (!order.orderTokens.includes(orderToken._id)) {
          order.orderTokens.push(orderToken._id);
        }
        order.holdOrderToken = null;
      } else {
        order.holdOrderToken = orderToken._id;
      }
    }

    // Creating a brand new token
    else {
      const foodOrderIds = [];

      if (newOrderToken.foodOrders?.length) {
        for (const food of newOrderToken.foodOrders) {
          const { _id, ...foodData } = food;
          const foodItem = new FoodOrderItem(foodData);
          await foodItem.save({ session });
          foodOrderIds.push(foodItem._id);
        }
      }

      const beverageOrderIds = [];
      if (newOrderToken.beverageOrders?.length) {
        for (const beverage of newOrderToken.beverageOrders) {
          const { _id, ...beverageData } = beverage; // strip old _id
          const beverageItem = new BeverageOrderItem(beverageData);
          await beverageItem.save({ session });
          beverageOrderIds.push(beverageItem._id);
        }
      }

      const tokenId = generateTokenId(order.orderNumber);
      orderToken = new OrderToken({
        tokenId,
        tokenNumber: newOrderToken.tokenNumber,
        foodOrders: foodOrderIds,
        beverageOrders: beverageOrderIds,
        isPrinted: newOrderToken.isPrinted,
        tokenSubTotal: newOrderToken.tokenSubTotal,
        tokenTax: newOrderToken.tokenTax,
        tokenDiscount: newOrderToken.tokenDiscount,
        tokenServiceCharge: newOrderToken.tokenServiceCharge,
        tokenTotalBill: newOrderToken.tokenTotalBill,
      });

      await orderToken.save({ session });

      if (orderToken.isPrinted) {
        order.orderTokens.push(orderToken._id);
        order.holdOrderToken = null;
      } else {
        order.holdOrderToken = orderToken._id;
      }
    }

    // Update order totals
    order.subTotal = subTotal;
    order.tax = tax;
    order.discount = discount;
    order.serviceCharge = serviceCharge;
    order.totalBill = totalBill;

    await order.save({ session });

    await session.commitTransaction();

    return sendSuccessResponse(res, 201, "Order token added successfully", {
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  } finally {
    session.endSession();
   }
};

export const updateOrderBillDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subTotal,
      tax,
      discount,
      serviceCharge,
      totalBill,
      paymentMethod,
    } = req.body;

    // Validate payment method
    if (
      paymentMethod &&
      ![
        PaymentMethods.CASH.value,
        PaymentMethods.CARD.value,
        PaymentMethods.FREE_BILL.value,
        PaymentMethods.ROOM.value,
      ].includes(paymentMethod)
    ) {
      return sendErrorResponse(res, 400, "Invalid payment method");
    }

    // Find and update the order
    const order = await Order.findByIdAndUpdate(
      id,
      {
        subTotal,
        tax,
        discount,
        serviceCharge,
        totalBill,
        paymentMethod,
        orderStatus: OrderStatuses.COMPLETED.value
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return sendErrorResponse(res, 404, "Order not found");
    }

    // If order has a restaurant table, update that table’s status to EMPTY
    if (order.restaurantTable) {
      await RestaurantTable.findByIdAndUpdate(
        order.restaurantTable,
        { status: TableStatuses.EMPTY.value },
        { new: true }
      );
    }

    return sendSuccessResponse(
      res,
      200,
      "Order billing details updated successfully",
      { order }
    );
  } catch (error) {
    console.error("Error updating order bill:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
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
      .populate("restaurantTable") // populate table details
      .populate({
        path: "orderTokens", // populate orderTokens
        populate: [
          {
            path: "foodOrders",
            model: "FoodOrderItem",
          },
          {
            path: "beverageOrders",
            model: "BeverageOrderItem",
          },
        ],
      })
      .populate({
        path: "holdOrderToken", // populate orderTokens
        populate: [
          {
            path: "foodOrders",
            model: "FoodOrderItem",
          },
          {
            path: "beverageOrders",
            model: "BeverageOrderItem",
          },
        ],
      });

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

export const getHoldOrders = async (req, res) => {
  try {

    const { userId } = req.user;

    const restaurantType = await getRestaurantTypeByUserRole(userId);

    // Find all orders where holdOrderToken is not null
    const holdOrders = await Order.find({
      restaurantType,
      $or: [
        { holdOrderToken: { $ne: null } },
        { orderStatus: { $ne: OrderStatuses.COMPLETED.value } },
      ],
    }).select("_id serviceType orderNumber");

    if (!holdOrders || holdOrders.length === 0) {
      return sendErrorResponse(res, 404, "No hold orders found");
    }

    // Format response
    const formattedOrders = holdOrders.map((order) => ({
      _id: order._id,
      serviceType: order.serviceType,
      orderNumber: order.orderNumber,
    }));

    return sendSuccessResponse(
      res,
      200,
      "Hold orders retrieved successfully",
      formattedOrders
    );
  } catch (error) {
    console.error("Error fetching hold orders:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const getDailyOrdersSummary = async (req, res) => {
  try {
    const { date } = req.query; // expected format: YYYY-MM-DD

    const { userId } = req.user;

    const restaurantType = await getRestaurantTypeByUserRole(userId);

    if (!date) {
      return sendErrorResponse(res, 400, "Date is required");
    }

    // Build start/end of day 
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    // Query orders within date range 
    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
      restaurantType
    })
      .populate({
        path: "orderTokens",
        populate: {
          path: "foodOrders",
          model: "FoodOrderItem",
        },
      })
      .lean();

    // Summary counts 
    const dineInCount = orders.filter(
      (o) => o.serviceType === ServiceTypes.DINE_IN.value
    ).length;
    const saveToRoomCount = orders.filter(
      (o) => o.serviceType === ServiceTypes.SAVE_TO_ROOM.value
    ).length;
    const takeAwayCount = orders.filter(
      (o) => o.serviceType === ServiceTypes.TAKE_AWAY.value
    ).length;

    // Count total tokens across all orders
    const totalTokens = orders.reduce((sum, order) => sum + (order.orderTokens?.length || 0), 0);

    // Transform orders into DailyOrder format 
    const dailyOrders = orders.map((order) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      serviceType: order.serviceType,
      orderTokens: order.orderTokens.map((token) => ({
        tokenNumber: token.tokenNumber,
        orderedTime: token.createdAt?.toISOString() ?? "",
        orderItems: token.foodOrders?.map((item) => item.title) ?? [],
      })),
    }));

    return sendSuccessResponse(res, 200, "Daily order summary retrieved successfully", {
      date,
      summary: {
        dineInCount,
        saveToRoomCount,
        takeAwayCount,
        totalOrders: orders.length,
        totalTokens, // added here
      },
      orders: dailyOrders,
    });
  } catch (error) {
    console.error("Error fetching daily orders:", error);
    return sendErrorResponse(res, 500, "Internal server error");
  }
};

export const getOrderSummary = async (req, res) => {
  try {
    console.log("order summary");

    // === Define date range (first day of month -> today) ===
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dateFilter = {
      createdAt: { $gte: firstDayOfMonth, $lte: today },
    };

    // ===== Orders grouped by restaurantType & serviceType =====
    const ordersByRestaurantType = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            restaurantType: "$restaurantType",
            serviceType: "$serviceType",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // ===== Customers grouped by restaurantType & customerType =====
    const customersByRestaurantType = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            restaurantType: "$restaurantType",
            customerType: "$customerType",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // ===== Beverage sales grouped by restaurantType & category =====
    const beverageSummary = await OrderToken.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "beverages",
          localField: "items.beverageId",
          foreignField: "_id",
          as: "beverageInfo",
        },
      },
      { $unwind: "$beverageInfo" },
      {
        $group: {
          _id: {
            restaurantType: "$restaurantType",
            category: "$beverageInfo.category",
          },
          totalAmount: { $sum: "$items.amount" },
        },
      },
    ]);

    // === Format response grouped by restaurantType ===
    const summaryByRestaurantType = {};

    const restaurantTypes = new Set([
      ...ordersByRestaurantType.map((o) => o._id.restaurantType),
      ...customersByRestaurantType.map((c) => c._id.restaurantType),
      ...beverageSummary.map((b) => b._id.restaurantType),
    ]);

    restaurantTypes.forEach((type) => {
      summaryByRestaurantType[type] = {
        orderSummary: {
          totalOrders: ordersByRestaurantType
            .filter((o) => o._id.restaurantType === type)
            .reduce((sum, o) => sum + o.count, 0),
          byServiceType: ordersByRestaurantType
            .filter((o) => o._id.restaurantType === type)
            .map((o) => ({
              serviceType: o._id.serviceType,
              count: o.count,
            })),
        },
        customerSummary: {
          totalCustomers: customersByRestaurantType
            .filter((c) => c._id.restaurantType === type)
            .reduce((sum, c) => sum + c.count, 0),
          byCustomerType: customersByRestaurantType
            .filter((c) => c._id.restaurantType === type)
            .map((c) => ({
              customerType: c._id.customerType,
              count: c.count,
            })),
        },
        beverageSummary: beverageSummary
          .filter((b) => b._id.restaurantType === type)
          .map((b) => ({
            category: b._id.category,
            totalAmount: b.totalAmount,
          })),
      };
    });

    // === Final Response ===
    return sendSuccessResponse(
      res,
      200,
      "Monthly order summary retrieved successfully",
      {
        dateRange: {
          from: firstDayOfMonth.toLocaleString("en-CA", {
            timeZone: "Asia/Colombo",
          }),
          to: today.toLocaleString("en-CA", { timeZone: "Asia/Colombo" }),
        },
        summaryByRestaurantType,
      }
    );

  } catch (error) {
    console.error("Error generating order summary:", error);
    return sendErrorResponse(res, 500, "Internal server error");
  }
};








