import express from "express";
import { generateInvoice, getInvoiceById, getInvoices } from "../../controllers/Reception/invoice-controller.js";
import { verifyTokenNotBlacklisted } from "../../middleware/check-black-list-token.js";
import { authenticateToken } from "../../middleware/verify-token.js";
import { userRoles } from "../../utils/enums/user-role.js";
import { authorizeRoles } from "../../middleware/role-authorize.js";

const router = express.Router();

router.post(
  "/",
  //verifyTokenNotBlacklisted,
  //authenticateToken,
  //authorizeRoles([userRoles.ADMIN.value, userRoles.RECEPTION.value, userRoles.SUPER_ADMIN.value]),
  generateInvoice
);

router.get(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.ADMIN.value, userRoles.SUPER_ADMIN.value]),
  getInvoices
);

router.get(
  "/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.ADMIN.value, userRoles.SUPER_ADMIN.value]),
  getInvoiceById
);

export { router as invoiceRoutes };
