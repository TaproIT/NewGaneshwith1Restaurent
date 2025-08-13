import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expireAt: { type: Date, required: true, index: { expires: 0 } },
});

const BlackListToken = mongoose.model(
  "BlacklistedToken",
  blacklistedTokenSchema
);

export default BlackListToken;
