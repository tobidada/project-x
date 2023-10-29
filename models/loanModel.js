import mongoose from "mongoose";
const { Schema } = mongoose;

const loanSchema = new Schema({
  loanId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: Date,
  isConsentReceived: { type: Boolean, default: false },
});

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
