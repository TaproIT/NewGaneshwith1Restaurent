import BeverageOrderItem from "../models/order/beverage-order-item-model.js";
import FoodOrderItem from "../models/order/food-order-item-model.js";
import Order from "../models/order/order-model.js";
import OrderToken from "../models/order/order-token-model.js";
import RestaurantTable from "../models/order/restaurant-table-model.js";
import { BeverageCategories, CustomerTypes, OrderStatuses, PaymentMethods, RestaurantTypes, ServiceTypes, TableStatuses } from "../utils/enums/order-related-enums.js";
import { generateOrderNumber, generateTokenId } from "../utils/order-util.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response-util.js";
import mongoose from "mongoose";
import { getRestaurantTypeByUserRole } from "../utils/user-util.js";
import { updateBeverageQuantityManually, updateBeverageVolumeManually } from "../utils/beverageStock.js";
import ExcelJS from "exceljs";
import PBFoodNet from "../models/PoolAndBeachResturant/PBFoodNet.js";
import ExtraBeverage from "../models/ExtraBeverages/extra-beverage-model.js";
import Beverage from "../models/Beverage/beverage.js";

export const setInitialOrderDetails = async (req, res) => {
    try{
        const {customerType, serviceType, roomNumber, guestName, guestId, bookingId } = req.body;

        const { userId } = req.user;

        const orderStatus = OrderStatuses.SET_INITIAL_ORDER_DATA.value;

         const restaurantType = await getRestaurantTypeByUserRole(userId);

        const orderNumber = await generateOrderNumber(restaurantType);

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
     orderStatus: {
       $nin: [OrderStatuses.COMPLETED.value, OrderStatuses.CANCELED.value],
     },
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

// export const addOrderToken = async (req, res) => {
//   const session = await Order.startSession();
//   session.startTransaction();

//   try {
//     const { id } = req.params; // order id
//     const { userId } = req.user;

//     const { newOrderToken, subTotal, tax, discount, serviceCharge, totalBill } =
//       req.body.data;
    
//     const restaurantType = await getRestaurantTypeByUserRole(userId);

//     const order = await Order.findById(id);
//     if (!order) {
//       await session.abortTransaction();
//       return sendErrorResponse(res, 404, "Order not found");
//     }

//     let orderToken;

//     // Updating an existing token
//     if (newOrderToken._id) {
//       orderToken = await OrderToken.findById(newOrderToken._id);
//       if (!orderToken) {
//         await session.abortTransaction();
//         return sendErrorResponse(res, 404, "Order token not found");
//       }

//       const foodOrderIds = [];
//       if (newOrderToken.foodOrders?.length) {
//          for (const food of newOrderToken.foodOrders) {
//           const { _id, ...foodData } = food;
          
//           foodData.liquor = [];

//           if (newOrderToken.isPrinted) {
//             const liquors = food.liquor;

//             if (liquors.length > 0) {
//               for (const liquor of liquors) {
//                 updateBeverageVolumeManually(
//                   liquor.beverage._id,
//                   liquor.amount * food.quantity
//                 );

//                  const liquorData = {
//                   liquorId: liquor.beverage._id,
//                   liquorName: liquor.beverage.beverageName,
//                   amount: liquor.amount * food.quantity,
//                 };
//                 // Push transformed liquor
//                 foodData.liquor.push(liquorData); 
//               }
//             }
//           }

//           foodData.restaurantType = restaurantType;

//           const foodItem = new FoodOrderItem(foodData);
//           await foodItem.save({ session });
//           foodOrderIds.push(foodItem._id);
//         }
//       }

//       const beverageOrderIds = [];
//       if (newOrderToken.beverageOrders?.length) {
//         for (const beverage of newOrderToken.beverageOrders) {
//           const { _id, ...beverageData } = beverage;

//           // Reset liquor array to remove incoming raw structure
//           beverageData.liquor = [];

//           if (newOrderToken.isPrinted) {
//             await updateBeverageQuantityManually(
//               beverage.beverageId,
//               beverage.quantity
//             );

//             const liquors = beverage.liquor || [];

//             if (liquors.length > 0) {
//               for (const liquor of liquors) {
//                 await updateBeverageVolumeManually(
//                   liquor.beverage._id,
//                   liquor.amount * beverage.quantity
//                 );

//                 const liquorData = {
//                   liquorId: liquor.beverage._id,
//                   liquorName: liquor.beverage.beverageName,
//                   amount: liquor.amount * beverage.quantity,
//                 };
//                 // Push transformed liquor
//                 beverageData.liquor.push(liquorData);
//               }
//             }
//           }

//           beverageData.restaurantType = restaurantType;

//           const beverageItem = new BeverageOrderItem(beverageData);
//           await beverageItem.save({ session });
//           beverageOrderIds.push(beverageItem._id);
//         }
//       }

//       orderToken.foodOrders = foodOrderIds;
//       orderToken.beverageOrders = beverageOrderIds;
//       orderToken.isPrinted = newOrderToken.isPrinted;
//       orderToken.tokenSubTotal = newOrderToken.tokenSubTotal;
//       orderToken.tokenTax = newOrderToken.tokenTax;
//       orderToken.tokenDiscount = newOrderToken.tokenDiscount;
//       orderToken.tokenServiceCharge = newOrderToken.tokenServiceCharge;
//       orderToken.tokenTotalBill = newOrderToken.tokenTotalBill;

//       await orderToken.save({ session });

//       if (newOrderToken.isPrinted) {
//         if (!order.orderTokens.includes(orderToken._id)) {
//           order.orderTokens.push(orderToken._id);
//         }
//         order.holdOrderToken = null;
//       } else {
//         order.holdOrderToken = orderToken._id;
//       }
//     }

//     // Creating a brand new token
//     else {
//       const foodOrderIds = [];

// if (newOrderToken.foodOrders?.length) {
//   for (const food of newOrderToken.foodOrders) {
//     const { _id, ...foodData } = food;

//     console.log(food);
//     console.log("f");

//     // Initialize liquor array
//     foodData.liquor = [];

//     // Calculate subtotal
//     foodData.subTotal = food.price * food.quantity;

//     if (newOrderToken.isPrinted) {
//       const liquors = food.liquor;

//       if (liquors.length > 0) {
//         for (const liquor of liquors) {
//           updateBeverageVolumeManually(
//             liquor.beverage._id,
//             liquor.amount * food.quantity
//           );

//           const liquorData = {
//             liquorId: liquor.beverage._id,
//             liquorName: liquor.beverage.beverageName,
//             amount: liquor.amount * food.quantity,
//           };

//           foodData.liquor.push(liquorData);
//         }
//       }
//     }

//     foodData.restaurantType = restaurantType;

//     const foodItem = new FoodOrderItem(foodData);
//     await foodItem.save({ session });
//     foodOrderIds.push(foodItem._id);
//   }
// }


//       const beverageOrderIds = [];
//       if (newOrderToken.beverageOrders?.length) {
//         for (const beverage of newOrderToken.beverageOrders) {
//           const { _id, ...beverageData } = beverage;

//           // Reset liquor array to remove incoming raw structure
//           beverageData.liquor = [];

//           if (newOrderToken.isPrinted) {
//             await updateBeverageQuantityManually(
//               beverage.beverageId,
//               beverage.quantity
//             );

//             const liquors = beverage.liquor || [];

//             if (liquors.length > 0) {
//               for (const liquor of liquors) {
//                 await updateBeverageVolumeManually(
//                   liquor.beverage._id,
//                   liquor.amount * beverage.quantity
//                 );

//                 const liquorData = {
//                   liquorId: liquor.beverage._id,
//                   liquorName: liquor.beverage.beverageName,
//                   amount: liquor.amount * beverage.quantity,
//                 };
//                 // Push transformed liquor
//                 beverageData.liquor.push(liquorData);
//               }
//             }
//           }

//           beverageData.restaurantType = restaurantType;

//           const beverageItem = new BeverageOrderItem(beverageData);
//           await beverageItem.save({ session });
        
//           beverageOrderIds.push(beverageItem._id);
//         }
//       }


//       const tokenId = generateTokenId(order.orderNumber);
//       orderToken = new OrderToken({
//         tokenId,
//         tokenNumber: newOrderToken.tokenNumber,
//         foodOrders: foodOrderIds,
//         beverageOrders: beverageOrderIds,
//         isPrinted: newOrderToken.isPrinted,
//         tokenSubTotal: newOrderToken.tokenSubTotal,
//         tokenTax: newOrderToken.tokenTax,
//         tokenDiscount: newOrderToken.tokenDiscount,
//         tokenServiceCharge: newOrderToken.tokenServiceCharge,
//         tokenTotalBill: newOrderToken.tokenTotalBill,
//       });

//       await orderToken.save({ session });

//       if (orderToken.isPrinted) {
//         order.orderTokens.push(orderToken._id);
//         order.holdOrderToken = null;
//       } else {
//         order.holdOrderToken = orderToken._id;
//       }
//     }

//     // Update order totals
//     order.subTotal = subTotal;
//     order.tax = tax;
//     order.discount = discount;
//     order.serviceCharge = serviceCharge;
//     order.totalBill = totalBill;

//     await order.save({ session });

//     await session.commitTransaction();

//     return sendSuccessResponse(res, 201, "Order token added successfully", {
//       order,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     return sendErrorResponse(res, 500, "Internal Server Error", error.message);
//   } finally {
//     session.endSession();
//    }
// };


export const addOrderToken = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // order id
    const { userId } = req.user;

    const { newOrderToken, subTotal, tax, discount, serviceCharge, totalBill } =
      req.body.data;

    const restaurantType = await getRestaurantTypeByUserRole(userId);

    const order = await Order.findById(id);
    if (!order) {
      await session.abortTransaction();
      return sendErrorResponse(res, 404, "Order not found");
    }

    // ==========================================================
    // 1. BACKEND SUBTOTAL CALCULATION (Security Check)
    // ==========================================================
    let backEndTokenSubTotal = 0;
    let backEndTokenServiceCharge = 0;
    let backEndTokenTotalBill = 0;

    // ==========================================================
    // CALCULATE FOOD SUBTOTAL USING PRICE FROM DB
    // ==========================================================
    if (newOrderToken.foodOrders?.length) {
      for (const food of newOrderToken.foodOrders) {
        // Fetch real price from PBFoodNet
        const foodItem = await PBFoodNet.findById(food.foodId);

        if (!foodItem) {
          await session.abortTransaction();
          return sendErrorResponse(
            res,
            400,
            `Food item not found: ${food.foodId}`
          );
        }

        const realPrice = Number(foodItem.price);
        const quantity = Number(food.quantity);

        backEndTokenSubTotal += realPrice * quantity;
      }
    }

    // ==========================================================
    // CALCULATE BEVERAGE SUBTOTAL USING CORRECT MODEL
    // ==========================================================
    if (newOrderToken.beverageOrders?.length) {
      for (const bev of newOrderToken.beverageOrders) {
        let realPrice = 0;
        const quantity = Number(bev.quantity);

        // Try loading from Beverage model (hard liquor / soft drinks)
        const beverageItem = await Beverage.findById(bev.beverageId);

        if (beverageItem) {
          // If found → category must be hard liquor or soft drinks
          realPrice = Number(beverageItem.price);
        } else {
          // Otherwise → must be ExtraBeverage model
          const extraBeverage = await ExtraBeverage.findById(bev.beverageId);

          if (!extraBeverage) {
            await session.abortTransaction();
            return sendErrorResponse(
              res,
              400,
              `Beverage item not found: ${bev.beverageId}`
            );
          }

          realPrice = Number(extraBeverage.price);
        }

        backEndTokenSubTotal += realPrice * quantity;
      }
    }

    // ==========================================================
    // SERVICE CHARGE & TOTAL BILL
    // ==========================================================
    backEndTokenServiceCharge = backEndTokenSubTotal * 0.1;

    backEndTokenTotalBill = backEndTokenServiceCharge + backEndTokenSubTotal;

     if (
      Number(backEndTokenSubTotal.toFixed(2)) !==
      Number(newOrderToken.tokenSubTotal.toFixed(2))
    ) {
      await session.abortTransaction();
      return sendErrorResponse(
        res,
        400,
        `Subtotal mismatch! Frontend: ${newOrderToken.tokenSubTotal}, Backend: ${backEndTokenSubTotal}`
      );
    }

    if (
      Number(backEndTokenServiceCharge.toFixed(2)) !==
      Number(newOrderToken.tokenServiceCharge.toFixed(2))
    ) {
      await session.abortTransaction();
      return sendErrorResponse(
        res,
        400,
        `Service charge mismatch! Frontend: ${newOrderToken.tokenServiceCharge}, Backend: ${backEndTokenServiceCharge}`
      );
    }

    if (
      Number(backEndTokenTotalBill.toFixed(2)) !==
      Number(newOrderToken.tokenTotalBill.toFixed(2))
    ) {
      await session.abortTransaction();
      return sendErrorResponse(
        res,
        400,
        `Total mismatch! Frontend: ${newOrderToken.tokenTotalBill}, Backend: ${backEndTokenTotalBill}`
      );
    }


    // ==========================================================
    // EXTRA VALIDATION: VERIFY (all existing tokens subtotal + new token subtotal)
    // ==========================================================

    // 1. Load all EXISTING printed order tokens of this order
    const existingTokens = await OrderToken.find({
      _id: { $in: order.orderTokens },
    });

    // 2. Calculate backend subtotal of existing tokens
    let existingTokensSubTotal = 0;

    let existingTokensServiceCharge = 0;

    let existingTokensTotalBill = 0;

    for (const token of existingTokens) {
      existingTokensSubTotal += Number(token.tokenSubTotal || 0);
      existingTokensServiceCharge += Number(token.tokenServiceCharge || 0);
      existingTokensTotalBill += Number(token.tokenTotalBill || 0);
    }

    // 3. Total subtotal = existing tokens subtotal + new token subtotal
    const grandBackEndSubTotal = existingTokensSubTotal + backEndTokenSubTotal;

    const grandBackEndServiceCharge =
      existingTokensServiceCharge + backEndTokenServiceCharge;

    const grandBackEndTotalBill =
      existingTokensTotalBill + backEndTokenTotalBill;

    // 4. Compare with subtotal coming from frontend
    if (
      Number(grandBackEndSubTotal.toFixed(2)) !== Number(subTotal.toFixed(2))
    ) {
      await session.abortTransaction();
      return sendErrorResponse(
        res,
        400,
        `Order subtotal mismatch! Frontend total: ${subTotal}, Backend total: ${grandBackEndSubTotal}`
      );
    }

    if (
      Number(grandBackEndServiceCharge.toFixed(2)) !==
      Number(serviceCharge.toFixed(2))
    ) {
      await session.abortTransaction();
      return sendErrorResponse(
        res,
        400,
        `Order service charge mismatch! Frontend total: ${serviceCharge}, Backend total: ${grandBackEndServiceCharge}`
      );
    }

    if (
      Number(grandBackEndTotalBill.toFixed(2)) !== Number(totalBill.toFixed(2))
    ) {
      await session.abortTransaction();
      return sendErrorResponse(
        res,
        400,
        `Order total bill mismatch! Frontend total: ${totalBill}, Backend total: ${grandBackEndTotalBill}`
      );
    }
   
    // ==========================================================
    // 2. PROCESS ORDER TOKEN (Create/Update)
    // ==========================================================

    let orderToken;

    // ----------------------------------------------------------
    // UPDATING AN EXISTING TOKEN
    // ----------------------------------------------------------
    if (newOrderToken._id) {
      orderToken = await OrderToken.findById(newOrderToken._id);

      if (!orderToken) {
        await session.abortTransaction();
        return sendErrorResponse(res, 404, "Order token not found");
      }

      const foodOrderIds = [];

      if (newOrderToken.foodOrders?.length) {
        for (const food of newOrderToken.foodOrders) {
          const { _id, ...foodData } = food;
          foodData.liquor = [];
          foodData.restaurantType = restaurantType;

          // Subtotal per food item
          foodData.subTotal = food.price * food.quantity;

          // Beverage volume updates if printed
          if (newOrderToken.isPrinted) {
            const liquors = food.liquor || [];

            for (const liquor of liquors) {
              updateBeverageVolumeManually(
                liquor.beverage._id,
                liquor.amount * food.quantity
              );

              foodData.liquor.push({
                liquorId: liquor.beverage._id,
                liquorName: liquor.beverage.beverageName,
                amount: liquor.amount * food.quantity,
              });
            }
          }

          const foodItem = new FoodOrderItem(foodData);
          await foodItem.save({ session });
          foodOrderIds.push(foodItem._id);
        }
      }

      // ----------------------------------------------------------
      // BEVERAGE ORDERS (UPDATE)
      // ----------------------------------------------------------
      const beverageOrderIds = [];

      if (newOrderToken.beverageOrders?.length) {
        for (const beverage of newOrderToken.beverageOrders) {
          const { _id, ...beverageData } = beverage;
          beverageData.liquor = [];
          beverageData.restaurantType = restaurantType;

          // Subtotal per beverage item
          beverageData.subTotal = beverage.price * beverage.quantity;

          if (newOrderToken.isPrinted) {
            await updateBeverageQuantityManually(
              beverage.beverageId,
              beverage.quantity
            );

            const liquors = beverage.liquor || [];

            for (const liquor of liquors) {
              await updateBeverageVolumeManually(
                liquor.beverage._id,
                liquor.amount * beverage.quantity
              );

              beverageData.liquor.push({
                liquorId: liquor.beverage._id,
                liquorName: liquor.beverage.beverageName,
                amount: liquor.amount * beverage.quantity,
              });
            }
          }

          const beverageItem = new BeverageOrderItem(beverageData);
          await beverageItem.save({ session });
          beverageOrderIds.push(beverageItem._id);
        }
      }

      // Update token data
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

    // ----------------------------------------------------------
    // CREATING A NEW TOKEN
    // ----------------------------------------------------------
    else {
      const foodOrderIds = [];

      if (newOrderToken.foodOrders?.length) {
        for (const food of newOrderToken.foodOrders) {
          const { _id, ...foodData } = food;

          foodData.liquor = [];
          foodData.restaurantType = restaurantType;

          // Subtotal per item
          foodData.subTotal = food.price * food.quantity;

          if (newOrderToken.isPrinted) {
            const liquors = food.liquor || [];

            for (const liquor of liquors) {
              updateBeverageVolumeManually(
                liquor.beverage._id,
                liquor.amount * food.quantity
              );

              foodData.liquor.push({
                liquorId: liquor.beverage._id,
                liquorName: liquor.beverage.beverageName,
                amount: liquor.amount * food.quantity,
              });
            }
          }

          const foodItem = new FoodOrderItem(foodData);
          await foodItem.save({ session });
          foodOrderIds.push(foodItem._id);
        }
      }

      const beverageOrderIds = [];

      if (newOrderToken.beverageOrders?.length) {
        for (const beverage of newOrderToken.beverageOrders) {
          const { _id, ...beverageData } = beverage;

          beverageData.liquor = [];
          beverageData.restaurantType = restaurantType;

          // Subtotal per beverage item
          beverageData.subTotal = beverage.price * beverage.quantity;

          if (newOrderToken.isPrinted) {
            await updateBeverageQuantityManually(
              beverage.beverageId,
              beverage.quantity
            );

            const liquors = beverage.liquor || [];

            for (const liquor of liquors) {
              await updateBeverageVolumeManually(
                liquor.beverage._id,
                liquor.amount * beverage.quantity
              );

              beverageData.liquor.push({
                liquorId: liquor.beverage._id,
                liquorName: liquor.beverage.beverageName,
                amount: liquor.amount * beverage.quantity,
              });
            }
          }

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

    // ==========================================================
    // 3. UPDATE ORDER TOTALS
    // ==========================================================
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

// export const updateOrderBillDetails = async (req, res) => {
//   try {
//     const {userId} = req.user;
//     const { id } = req.params;
//     const {
//       subTotal,
//       tax,
//       discount,
//       serviceCharge,
//       totalBill,
//       paymentMethod,
//     } = req.body;

//     // Validate payment method
//     if (
//       paymentMethod &&
//       ![
//         PaymentMethods.CASH.value,
//         PaymentMethods.CARD.value,
//         PaymentMethods.FREE_BILL.value,
//         PaymentMethods.ROOM.value,
//       ].includes(paymentMethod)
//     ) {
//       return sendErrorResponse(res, 400, "Invalid payment method");
//     }

//     // Find and update the order
//     const order = await Order.findByIdAndUpdate(
//       id,
//       {
//         subTotal,
//         tax,
//         discount,
//         serviceCharge,
//         totalBill,
//         paymentMethod,
//         orderStatus: OrderStatuses.COMPLETED.value,
//         checkOutUser: userId
//       },
//       { new: true, runValidators: true }
//     );

//     if (!order) {
//       return sendErrorResponse(res, 404, "Order not found");
//     }

//     // If order has a restaurant table, update that table’s status to EMPTY
//     if (order.restaurantTable) {
//       await RestaurantTable.findByIdAndUpdate(
//         order.restaurantTable,
//         { status: TableStatuses.EMPTY.value },
//         { new: true }
//       );
//     }

//     return sendSuccessResponse(
//       res,
//       200,
//       "Order billing details updated successfully",
//       { order }
//     );
//   } catch (error) {
//     console.error("Error updating order bill:", error);
//     return sendErrorResponse(res, 500, "Internal Server Error", error.message);
//   }
// };

export const updateOrderBillDetails = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
  
    const {
      subTotal,
      tax = 0,
      discount = 0,
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

    if (paymentMethod === PaymentMethods.FREE_BILL.value) {
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          subTotal:0,
          tax:0,
          discount:0,
          serviceCharge:0,
          totalBill:0,
          paymentMethod,
          orderStatus: OrderStatuses.COMPLETED.value,
          checkOutUser: userId,
        },
        { new: true, runValidators: true }
      );

      // If linked table exists, mark table as EMPTY
      if (updatedOrder.restaurantTable) {
        await RestaurantTable.findByIdAndUpdate(updatedOrder.restaurantTable, {
          status: TableStatuses.EMPTY.value,
        });
      }

      return sendSuccessResponse(
        res,
        200,
        "Order billing details updated successfully",
        { order: updatedOrder }
      );
    }

    // Fetch order safely
    const order = await Order.findById(id);
    if (!order) {
      return sendErrorResponse(res, 404, "Order not found");
    }

    // ---------------------------------------------------
    // 🔍 BACKEND CALCULATE EXPECTED TOTAL
    // ---------------------------------------------------

    // total = subTotal + serviceCharge + tax − 
    const discountAmount = ((discount/100)*subTotal);

    const backendTotal = Number(
      order.subTotal + order.serviceCharge + order.tax  - discountAmount
    );

    // ---------------------------------------------------
    // ❗COMPARE FRONTEND TOTAL VS BACKEND TOTAL
    // ---------------------------------------------------
    if (backendTotal !== totalBill) {
      return sendErrorResponse(
        res,
        400,
        `Total bill mismatch! Frontend: ${totalBill}, Backend: ${backendTotal}`
      );
    }

    // ---------------------------------------------------
    // 👍 Update order if values are correct
    // ---------------------------------------------------
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        subTotal,
        tax,
        discount,
        serviceCharge,
        totalBill: backendTotal,
        paymentMethod,
        orderStatus: OrderStatuses.COMPLETED.value,
        checkOutUser: userId
      },
      { new: true, runValidators: true }
    );

    // If linked table exists, mark table as EMPTY
    if (updatedOrder.restaurantTable) {
      await RestaurantTable.findByIdAndUpdate(
        updatedOrder.restaurantTable,
        { status: TableStatuses.EMPTY.value }
      );
    }

    return sendSuccessResponse(
      res,
      200,
      "Order billing details updated successfully",
      { order: updatedOrder }
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
      })
      .populate({
        path: "checkOutUser",
        select: "_id name userRole",
      })

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
      orderStatus: {
        $nin: [OrderStatuses.COMPLETED.value, OrderStatuses.CANCELED.value],
      },
      $or: [
        { holdOrderToken: { $ne: null } },
        {
          orderStatus: {
            $nin: [OrderStatuses.COMPLETED.value, OrderStatuses.CANCELED.value],
          },
        },
      ],
    })
      .select(
        "_id serviceType orderNumber customerType guestName restaurantTable roomNumber"
      )
      .populate("restaurantTable", "tableNumber");

    if (!holdOrders || holdOrders.length === 0) {
      return sendErrorResponse(res, 404, "No hold orders found");
    }

    // Format response
    const formattedOrders = holdOrders.map((order) => ({
      _id: order._id,
      serviceType: order.serviceType,
      customerType: order.customerType,
      guestName: order.guestName,
      restaurantTable: order.restaurantTable,
      orderNumber: order.orderNumber,
      roomNumber: order.roomNumber
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

// export const getDailyOrdersSummary = async (req, res) => {
//   try {
//     const { date } = req.query; // expected format: YYYY-MM-DD

//     const { userId } = req.user;

//     const restaurantType = await getRestaurantTypeByUserRole(userId);

//     if (!date) {
//       return sendErrorResponse(res, 400, "Date is required");
//     }

//     // Build start/end of day 
//     const start = new Date(date);
//     const end = new Date(date);
//     end.setDate(end.getDate() + 1);

//     // Query orders within date range 
//     const orders = await Order.find({
//       createdAt: { $gte: start, $lt: end },
//       restaurantType,
//       orderStatus: OrderStatuses.COMPLETED.value
//     })
//       .populate({
//         path: "orderTokens", 
//         populate: [
//           {
//             path: "foodOrders",
//             model: "FoodOrderItem",
//           },
//           {
//             path: "beverageOrders",
//             model: "BeverageOrderItem",
//           },
//         ],
//       })
//       .lean();

//     // Summary counts 
//     const dineInCount = orders.filter(
//       (o) => o.serviceType === ServiceTypes.DINE_IN.value
//     ).length;
//     const saveToRoomCount = orders.filter(
//       (o) => o.serviceType === ServiceTypes.SAVE_TO_ROOM.value
//     ).length;
//     const takeAwayCount = orders.filter(
//       (o) => o.serviceType === ServiceTypes.TAKE_AWAY.value
//     ).length;

//     // Count total tokens across all orders
//     const totalTokens = orders.reduce((sum, order) => sum + (order.orderTokens?.length || 0), 0);

//     // Transform orders into DailyOrder format 
//     const dailyOrders = orders.map((order) => ({
//       _id: order._id.toString(),
//       orderNumber: order.orderNumber,
//       roomNumber: order.roomNumber,
//       serviceType: order.serviceType,
//       customerType: order.customerType,
//       orderTokens: order.orderTokens.map((token) => ({
//         tokenNumber: token.tokenNumber,
//         orderedTime: token.createdAt?.toISOString() ?? "",
//         orderItems: [...token.foodOrders?.map((item) => item.title), ...token.beverageOrders?.map((item) => item.title)] ?? [],
//       })),
//     }));

//     return sendSuccessResponse(res, 200, "Daily order summary retrieved successfully", {
//       date,
//       summary: {
//         dineInCount,
//         saveToRoomCount,
//         takeAwayCount,
//         totalOrders: orders.length,
//         totalTokens, // added here
//       },
//       orders: dailyOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching daily orders:", error);
//     return sendErrorResponse(res, 500, "Internal server error");
//   }
// };


export const getDailyOrdersSummary = async (req, res) => {
  try {
    const { startDate, endDate, restaurantType } = req.query; // YYYY-MM-DD
    const { userId } = req.user;

    const defaultRestaurantType = await getRestaurantTypeByUserRole(userId);

    if (!startDate || !endDate) {
      return sendErrorResponse(res, 400, "Start date and end date are required");
    }

    console.log(restaurantType);

    const finalRestaurantType =
      restaurantType && restaurantType.trim() !== ""
        ? restaurantType
        : defaultRestaurantType;

    // Build start date = 00:00:00 and end date = next day 00:00:00
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // include full endDate day

    // Find orders within range
    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
      restaurantType: finalRestaurantType,
      orderStatus: OrderStatuses.COMPLETED.value,
    })
      .populate({
        path: "orderTokens",
        populate: [
          { path: "foodOrders", model: "FoodOrderItem" },
          { path: "beverageOrders", model: "BeverageOrderItem" },
        ],
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

    // Count total tokens
    const totalTokens = orders.reduce(
      (sum, order) => sum + (order.orderTokens?.length || 0),
      0
    );

    // Prepare daily order list
    const dailyOrders = orders.map((order) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      roomNumber: order.roomNumber,
      paymentMethod: order.paymentMethod,
      serviceType: order.serviceType,
      customerType: order.customerType,
      orderTokens: order.orderTokens.map((token) => ({
        tokenNumber: token.tokenNumber,
        orderedTime: token.createdAt?.toISOString() ?? "",
        orderItems: [
          ...token.foodOrders?.map((item) => item.title),
          ...token.beverageOrders?.map((item) => item.title),
        ],
      })),
    }));

    return sendSuccessResponse(
      res,
      200,
      "Order summary retrieved successfully",
      {
        startDate,
        endDate,
        summary: {
          dineInCount,
          saveToRoomCount,
          takeAwayCount,
          totalOrders: orders.length,
          totalTokens,
        },
        orders: dailyOrders,
      }
    );
  } catch (error) {
    console.error("Error fetching order summary:", error);
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

// export const getBeverageSoldSummary = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         status: "fail",
//         message: "startDate and endDate are required",
//       });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999); // Include full end day

//     // Aggregate total quantity per beverage
//     const result = await BeverageOrderItem.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: "$beverageId",
//           beverageId: { $first: "$beverageId" },
//           title: { $first: "$title" },
//           category: { $first: "$category" },
//           totalQuantity: { $sum: "$quantity" },
//         },
//       },
//     ]);

//     // Separate arrays
//     const hardLiquors = result.filter(
//       (item) => item.category === BeverageCategories.HARD_LIQUOR.value
//     );

//     const softDrinks = result.filter(
//       (item) => item.category === BeverageCategories.SOFT_DRINKS.value
//     );

//     const others = result.filter(
//       (item) =>
//         item.category !== BeverageCategories.HARD_LIQUOR.value &&
//         item.category !== BeverageCategories.SOFT_DRINKS.value
//     );

//     // Calculate total quantities
//     const hardLiquorTotal = hardLiquors.reduce(
//       (sum, item) => sum + item.totalQuantity,
//       0
//     );

//     const softDrinkTotal = softDrinks.reduce(
//       (sum, item) => sum + item.totalQuantity,
//       0
//     );

//     return res.status(200).json({
//       status: "success",
//       data: {
//         hardLiquors,
//         softDrinks,
//         others,
//         hardLiquorTotal,
//         softDrinkTotal,
//       },
//     });
//   } catch (error) {
//     console.error("Error getting beverage totals:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Server error while fetching totals",
//     });
//   }
// };



// export const getLiquorSummaryForOtherItems = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return sendErrorResponse(res, 400, "startDate and endDate are required");
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);

//     // Fetch BeverageOrderItems excluding HARD_LIQUOR and SOFT_DRINKS
//     const beverageOrders = await BeverageOrderItem.find({
//       createdAt: { $gte: start, $lte: end },
//       category: { $nin: [BeverageCategories.HARD_LIQUOR.value, BeverageCategories.SOFT_DRINKS.value] },
//       "liquor.0": { $exists: true },
//     }).lean();

//     // Fetch FoodOrderItems that have liquor
//     const foodOrders = await FoodOrderItem.find({
//       createdAt: { $gte: start, $lte: end },
//       "liquor.0": { $exists: true },
//     }).lean();

//     // Combine both arrays
//     const combinedOrders = [...beverageOrders, ...foodOrders];

//     // Flatten all liquor entries
//     const allLiquors = combinedOrders.flatMap(order =>
//       order.liquor.map(l => ({
//         liquorId: l.liquorId,
//         liquorName: l.liquorName,
//         amount: l.amount || 0,
//       }))
//     );

//     // Group by liquorId + liquorName
//     const summaryMap = new Map();
//     allLiquors.forEach(l => {
//       const key = `${l.liquorId}-${l.liquorName}`;
//       if (summaryMap.has(key)) {
//         summaryMap.set(key, summaryMap.get(key) + l.amount);
//       } else {
//         summaryMap.set(key, l.amount);
//       }
//     });

//     // Prepare summary array
//     const summary = Array.from(summaryMap, ([key, totalAmount]) => {
//       const [liquorId, liquorName] = key.split("-");
//       return { liquorId, liquorName, totalAmount };
//     });

//     // Total liquor amount
//     const totalLiquorAmount = summary.reduce((sum, item) => sum + item.totalAmount, 0);

//     return sendSuccessResponse(res, 200, "Liquor summary for other items retrieved successfully", {
//       dateRange: {
//         from: start.toLocaleString("en-CA", { timeZone: "Asia/Colombo" }),
//         to: end.toLocaleString("en-CA", { timeZone: "Asia/Colombo" }),
//       },
//       summary,
//       totalLiquorAmount,
//     });
//   } catch (error) {
//     console.error("Error fetching liquor summary for other items:", error);
//     return sendErrorResponse(res, 500, "Server error while fetching liquor summary for other items");
//   }
// };


export const getBeverageSoldSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "fail",
        message: "startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Aggregate total quantity per beverage & restaurant type
    const result = await BeverageOrderItem.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { beverageId: "$beverageId", restaurantType: "$restaurantType" },
          beverageId: { $first: "$beverageId" },
          title: { $first: "$title" },
          category: { $first: "$category" },
          restaurantType: { $first: "$restaurantType" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    // Helper to filter by category and restaurant type
    const filterByCategoryAndType = (category, type) =>
      result.filter(
        (item) => item.category === category && item.restaurantType === type
      );

    const summaryByRestaurantType = {};

    Object.values(RestaurantTypes).forEach((type) => {
      summaryByRestaurantType[type.value] = {
        hardLiquors: filterByCategoryAndType(BeverageCategories.HARD_LIQUOR.value, type.value),
        softDrinks: filterByCategoryAndType(BeverageCategories.SOFT_DRINKS.value, type.value),
        others: result.filter(
          (item) =>
            item.category !== BeverageCategories.HARD_LIQUOR.value &&
            item.category !== BeverageCategories.SOFT_DRINKS.value &&
            item.restaurantType === type.value
        ),
        hardLiquorTotal: filterByCategoryAndType(BeverageCategories.HARD_LIQUOR.value, type.value).reduce(
          (sum, item) => sum + item.totalQuantity,
          0
        ),
        softDrinkTotal: filterByCategoryAndType(BeverageCategories.SOFT_DRINKS.value, type.value).reduce(
          (sum, item) => sum + item.totalQuantity,
          0
        ),
      };
    });

    return res.status(200).json({
      status: "success",
      data: {
        summaryByRestaurantType,
        dateRange: {
          from: start.toISOString(),
          to: end.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error getting beverage totals:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching totals",
    });
  }
};

export const getLiquorSummaryForOtherItems = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return sendErrorResponse(res, 400, "startDate and endDate are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch BeverageOrderItems excluding HARD_LIQUOR and SOFT_DRINKS that have liquor
    const beverageOrders = await BeverageOrderItem.find({
      createdAt: { $gte: start, $lte: end },
      category: { $nin: [BeverageCategories.HARD_LIQUOR.value, BeverageCategories.SOFT_DRINKS.value] },
      "liquor.0": { $exists: true },
    }).lean();

    // Fetch FoodOrderItems that have liquor
    const foodOrders = await FoodOrderItem.find({
      createdAt: { $gte: start, $lte: end },
      "liquor.0": { $exists: true },
    }).lean();

    // Combine both arrays
    const combinedOrders = [...beverageOrders, ...foodOrders];

    const summaryByRestaurantType = {};

    // Initialize restaurant types
    Object.values(RestaurantTypes).forEach((type) => {
      summaryByRestaurantType[type.value] = {
        summary: [],
        totalLiquorAmount: 0,
      };
    });

    // Group liquors by restaurant type and liquorId + liquorName
    Object.values(RestaurantTypes).forEach((type) => {
      const ordersByType = combinedOrders.filter(order => order.restaurantType === type.value);

      const allLiquors = ordersByType.flatMap(order =>
        order.liquor.map(l => ({
          liquorId: l.liquorId,
          liquorName: l.liquorName,
          amount: l.amount || 0,
        }))
      );

      const summaryMap = new Map();
      allLiquors.forEach(l => {
        const key = `${l.liquorId}-${l.liquorName}`;
        if (summaryMap.has(key)) {
          summaryMap.set(key, summaryMap.get(key) + l.amount);
        } else {
          summaryMap.set(key, l.amount);
        }
      });

      const summary = Array.from(summaryMap, ([key, totalAmount]) => {
        const [liquorId, liquorName] = key.split("-");
        return { liquorId, liquorName, totalAmount };
      });

      const totalLiquorAmount = summary.reduce((sum, item) => sum + item.totalAmount, 0);

      summaryByRestaurantType[type.value] = { summary, totalLiquorAmount };
    });

    return sendSuccessResponse(res, 200, "Liquor summary for other items retrieved successfully", {
      dateRange: {
        from: start.toLocaleString("en-CA", { timeZone: "Asia/Colombo" }),
        to: end.toLocaleString("en-CA", { timeZone: "Asia/Colombo" }),
      },
      summaryByRestaurantType,
    });
  } catch (error) {
    console.error("Error fetching liquor summary for other items:", error);
    return sendErrorResponse(res, 500, "Server error while fetching liquor summary for other items");
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return sendErrorResponse(res, 404, "Order not found");
    }

    // Update the order status to canceled
    order.orderStatus = OrderStatuses.CANCELED.value;
    await order.save();

    // If the order has a restaurant table, mark it as EMPTY or AVAILABLE
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
      "Order canceled successfully",
      { order }
    );
  } catch (error) {
    console.error("Error canceling order:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const getDailyRestaurantTotals = async (req, res) => {
  try {
    const { startDate, endDate, restaurantType } = req.query;
    const { userId } = req.user;

    const defaultRestaurantType = await getRestaurantTypeByUserRole(userId);

     const finalRestaurantType =
      restaurantType && restaurantType.trim() !== ""
        ? restaurantType
        : defaultRestaurantType;

    if (!startDate || !endDate) {
      return sendErrorResponse(
        res,
        400,
        "startDate and endDate are required"
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const data = await Order.aggregate([
      {
        $match: {
          restaurantType: finalRestaurantType,
          createdAt: { $gte: start, $lte: end },
          orderStatus: OrderStatuses.COMPLETED.value,
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            customerType: "$customerType"
          },
          totalSubTotal: { $sum: "$subTotal" },
          totalServiceCharge: { $sum: "$serviceCharge" },
          totalBill: { $sum: "$totalBill" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          customerType: "$_id.customerType",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day"
                }
              }
            }
          },
          totalSubTotal: 1,
          totalServiceCharge: 1,
          totalBill: 1,
          orderCount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    let totalIncome = 0;
    let walkInIncome = 0;
    let checkInIncome = 0;

    data.forEach((dailySummary) => {
      totalIncome += dailySummary.totalBill;

      if (dailySummary.customerType === CustomerTypes.WALK_IN.value) {
        walkInIncome += dailySummary.totalBill;
      } else {
        checkInIncome += dailySummary.totalBill;
      }
    });

    const responseData = {
      restaurantType: RestaurantTypes.BEACH.value,
      totalIncome: Math.round(totalIncome * 100) / 100,
      walkInIncome: Math.round(walkInIncome * 100) / 100,
      checkInIncome: Math.round(checkInIncome * 100) / 100,
      summaryList: data,
    };

    return sendSuccessResponse(
      res,
      200,
      "Daily restaurant totals fetched successfully",
      responseData
    );

  } catch (err) {
    console.error(err);
    return sendErrorResponse(
      res,
      500,
      "Internal Server Error"
    );
  }
};

export const exportRestaurantSummaryExcel = async (req, res) => {
  try {
    const { startDate, endDate, restaurantType } = req.query;
    const { userId } = req.user;

    const defaultRestaurantType = await getRestaurantTypeByUserRole(userId);

     const finalRestaurantType =
      restaurantType && restaurantType.trim() !== ""
        ? restaurantType
        : defaultRestaurantType;

    if (!startDate || !endDate) {
      return sendErrorResponse(res, 400, "startDate and endDate are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const summaryData = await Order.aggregate([
      {
        $match: {
          restaurantType: finalRestaurantType,
          createdAt: { $gte: start, $lte: end },
          orderStatus: OrderStatuses.COMPLETED.value,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            customerType: "$customerType",
          },
          totalSubTotal: { $sum: "$subTotal" },
          totalServiceCharge: { $sum: "$serviceCharge" },
          totalBill: { $sum: "$totalBill" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          customerType: "$_id.customerType",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          totalSubTotal: 1,
          totalServiceCharge: 1,
          totalBill: 1,
          orderCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // ===== Number Formatter =====
    const formatNumber = (value) => {
      return Number(value)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    // ===== Calculate Totals =====
    let totalIncome = 0,
      walkInIncome = 0,
      checkInIncome = 0;

    summaryData.forEach((item) => {
      totalIncome += item.totalBill;

      if (item.customerType === CustomerTypes.WALK_IN.value) {
        walkInIncome += item.totalBill;
      } else {
        checkInIncome += item.totalBill;
      }
    });

    // ===== Restaurant Long Title =====
    const restaurantTitle =
      finalRestaurantType === RestaurantTypes.BEACH.value
        ? "GANESH GARDEN BEACH CABANA - MAHI MAHI SEA FOOD RESTAURANT"
        : finalRestaurantType === RestaurantTypes.NEW.value
        ? "GANESH GARDEN BEACH CABANA - NEW RESTAURANT"
        : "MARAKOLLIYA BEACH RESORT - SUNSET POOL BAR & RESTAURANT";

    // CREATE EXCEL
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Restaurant Summary");

    // MERGE TITLE AREA
    sheet.mergeCells("A1:F2");

    // Only set alignment, font, fill, and value on the **top-left cell**
    const titleCell = sheet.getCell("A1");
    titleCell.value = restaurantTitle;
    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true, // important for multiple lines
    };
    titleCell.font = { size: 16, bold: true };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2CC" }, // light yellow
    };

    // Optional: Increase row heights for better vertical centering
    sheet.getRow(1).height = 30;
    sheet.getRow(2).height = 30;


    // ===== SUMMARY TABLE (Left Side) =====
    sheet.addRow([]);
    sheet.addRow(["Summary", "Income"]);
    sheet.addRow(["Check-In", formatNumber(checkInIncome)]);
    sheet.addRow(["Walk-In", formatNumber(walkInIncome)]);
    sheet.addRow(["Total", formatNumber(totalIncome)]);

    // Bold header
    sheet.getRow(3).eachCell((c) => (c.font = { bold: true }));

    // Right align income column
    sheet.getColumn(2).alignment = { horizontal: "right" };

    // ===== Empty Row Gap =====
    sheet.addRow([]);

    // ===== MAIN TABLE HEADER =====
    const headerRow = sheet.addRow([
      "Date",
      "Customer Type",
      "Sub Total",
      "Service Charge",
      "Total Bill",
      "Order Count",
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDDEBF7" },
      };
    });

    // ===== INSERT MAIN TABLE DATA =====
    summaryData.forEach((item) => {
      const row = sheet.addRow([
        item.date,
        item.customerType,
        formatNumber(item.totalSubTotal),
        formatNumber(item.totalServiceCharge),
        formatNumber(item.totalBill),
        item.orderCount,
      ]);

      // Right-align numeric columns
      row.getCell(3).alignment = { horizontal: "right" };
      row.getCell(4).alignment = { horizontal: "right" };
      row.getCell(5).alignment = { horizontal: "right" };
      row.getCell(6).alignment = { horizontal: "right" };
    });

    // Auto column width
    sheet.columns.forEach((col) => (col.width = 20));

    // Send Excel
    const fileName = `Restaurant-Summary-${startDate}-to-${endDate}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    return sendErrorResponse(res, 500, "Unable to generate Excel");
  }
};

// ================================================================
// Check for Pending Orders on a Booking (for checkout validation)
// ================================================================
export const checkPendingOrdersForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate booking ID format
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return sendErrorResponse(res, 400, "Invalid booking ID format");
    }

    // Find orders for this booking that are NOT completed or canceled
    const pendingOrders = await Order.find({
      bookingId,
      orderStatus: {
        $nin: [OrderStatuses.COMPLETED.value, OrderStatuses.CANCELED.value],
      },
    })
      .select("_id orderNumber orderStatus guestName totalBill subTotal serviceCharge restaurantType")
      .lean();

    // Check if there are any pending orders
    const hasPendingOrders = pendingOrders.length > 0;

    // Calculate total pending amount
    const totalPendingAmount = pendingOrders.reduce(
      (sum, order) => sum + (order.totalBill || 0),
      0
    );

    return sendSuccessResponse(res, 200, "Pending orders checked successfully", {
      bookingId,
      hasPendingOrders,
      pendingOrdersCount: pendingOrders.length,
      totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
      pendingOrders: hasPendingOrders
        ? pendingOrders.map((order) => ({
            orderId: order._id,
            restaurantType: order.restaurantType,
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            guestName: order.guestName,
            totalBill: order.totalBill,
            subTotal: order.subTotal,
            serviceCharge: order.serviceCharge,
          }))
        : [],
    });
  } catch (error) {
    console.error("Error checking pending orders:", error);
    return sendErrorResponse(
      res,
      500,
      "Internal Server Error",
      error.message
    );
  }
};













