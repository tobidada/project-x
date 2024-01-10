import mongoose from "mongoose";
const { Schema } = mongoose;

const loanSchema = new Schema({
  bvn: { type: String, unique: true, required: true },
  businessRegistrationNumber: { type: String, unique: true },
  taxIdentificationNumber: { type: String, unique: true, required: true },
  loanReference: { type: String, unique: true, required: true },
  customerID: { type: String, unique: true, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, unique: true, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  loanAmount: { type: Number, required: true },
  totalRepaymentExpected: { type: Number, required: true },
  linkedAccountNumber: { type: Number, required: true },
  repaymentType: { type: String, required: true, default: "Recovery" },
  preferredRepaymentBankCBNCode: { type: String, required: true },
  preferredRepaymentAccount: { type: String, required: true },
  collectionPaymentSchedules: { type: Array },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: Date,
  isLoanApproved: { type: Boolean, default: false },
  isConsentReceived: { type: Boolean, default: false },
});

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
