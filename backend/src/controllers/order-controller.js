import BeverageOrderItem from "../models/order/beverage-order-item-model.js";
import FoodOrderItem from "../models/order/food-order-item-model.js";
import Order from "../models/order/order-model.js";
import OrderToken from "../models/order/order-token-model.js";
import { OrderStatuses, OrderTypes } from "../utils/enums/order-related-enums.js";
import { generateOrderNumber, generateTokenId } from "../utils/order-util.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response-util.js";

export const setInitialOrderDetails = async (req, res) => {
    try{
        const {guestType, orderType, roomNumber } = req.body;

        const orderStatus = OrderStatuses.SET_INITIAL_ORDER_DATA.value;

        const orderNumber = await generateOrderNumber();

        const newOrder = await Order.create({
            orderNumber,
            guestType,
            orderType,
            roomNumber,
            orderStatus
        });

        sendSuccessResponse(res,201, "Successfully set order initial data", {order:newOrder});
    }catch(error){
        sendErrorResponse(res,500,"Internal Server Error", error.message);
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
    if (order.orderType !== OrderTypes.DINE_IN.value) {
      return sendErrorResponse(
        res,
        400,
        "A table can only be selected for dine-in orders"
      );
    }

    // ✅ Allow selecting a table only if the order is in the "SET_INITIAL_ORDER_DATA" status
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

    // ✅ Assign the table
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




