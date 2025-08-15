import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  access_token: String,
  refresh_token: String,
  token_type: { type: String, default: "Bearer" },
  scope: String,
  expires_at: Date, // when the access_token expires
}, { _id: false });

const UserSchema = new mongoose.Schema({
  airtableUserId: { type: String, index: true },
  email: String,
  name: String,
  avatar: String,
  tokens: TokenSchema
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
