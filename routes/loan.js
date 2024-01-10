import express from "express";
const router = express.Router();
import { isVerifiedClient } from "../middlewares.js";
import Loan from "../models/loanModel.js";

/* POST receive approved loan from approval service. */
/**
 * @openapi
 * '/loan/create':
 *  post:
 *    tags:
 *      - Loan
 *    summary: Receive approved loan from approval service
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - bvn
 *              - businessRegistrationNumber
 *              - taxIdentificationNumber
 *              - loanReference
 *              - customerID
 *              - customerName
 *              - customerEmail
 *              - phoneNumber
 *              - loanAmount
 *              - totalRepaymentExpected
 *              - linkedAccountNumber
 *              - repaymentType
 *              - preferredRepaymentBankCBNCode
 *              - collectionPaymentSchedules
 *            properties:
 *              bvn:
 *                type: string
 *                default: 123456789
 *              businessRegistrationNumber:
 *                type: string
 *                default: 123456789
 *              taxIdentificationNumber:
 *                type: string
 *                default: 123456789
 *              loanReference:
 *                type: string
 *                default: reference
 *              customerID:
 *                type: string
 *                default: 123456789
 *              customerName:
 *                type: string
 *                default: John Doe
 *              customerEmail:
 *                type: string
 *                default: johndoe@email.com
 *              phoneNumber:
 *                type: string
 *                default: 123456789
 *              loanAmount:
 *                type: number
 *                default: 30000
 *              totalRepaymentExpected:
 *                type: number
 *                default: 30000
 *              linkedAccountNumber:
 *                type: number
 *                default: 1234567
 *              repaymentType:
 *                type: string
 *                default: Recovery
 *              preferredRepaymentBankCBNCode:
 *                type: string
 *                default: 123
 *              preferredRepaymentAccount:
 *                type: number
 *                default: 1234567
 *              collectionPaymentSchedules:
 *                type: array
 *                default: []
 *
 *    responses:
 *      201:
 *        description: Loan successfully stored
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                loan:
 *                  type: object
 *                  properties:
 *                    loanReference:
 *                      type: string
 *                    customerName:
 *                      type: string
 *                    loanAmount:
 *                      type: number
 *                    createdAt:
 *                      type: string
 *                    isLoanApproved:
 *                      type: boolean
 *                    isConsentReceived:
 *                      type: boolean
 *      400:
 *        description: Error occurred
 *
 */
router.post("/create", isVerifiedClient, async (req, res) => {

  // const {
  //   bvn,
  //   businessRegistrationNumber,
  //   taxIdentificationNumber,
  //   loanReference,
  //   customerID,
  //   customerName,
  //   customerEmail,
  //   phoneNumber,
  //   loanAmount,
  //   totalRepaymentExpected,
  //   loanTenure,
  //   linkedAccountNumber,
  //   repaymentType,
  //   preferredRepaymentBankCBNCode,
  //   preferredRepaymentAccount,
  //   collectionPaymentSchedules,
  // } = req.body;

  const { loanReference, customerID, loanAmount } = req.body;

  if(loanReference && customerID && loanAmount){
    try {
      const loan = new Loan({ ...req.body });
      await loan.save();
      const {loanReference, customerName, loanAmount, createdAt, isLoanApproved, isConsentReceived } = loan

      return res.status(201).json({
        message: "Loan successfully created",
        loan: {
          loanReference,
          customerName,
          loanAmount,
          createdAt,
          isLoanApproved,
          isConsentReceived
        },
      });
    } catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }
  }
  return res.status(400).json({
    error: "Missing Loan information"
  });
});

/* PUT approve loan and request consent */
/**
 * @openapi
 * '/loan/approveAndRequestConsent/:loanReference':
 *  put:
 *    tags:
 *      - Loan
 *    summary: Approved loan and request consent
 *    responses:
 *      201:
 *        description: Loan successfully approved and consent requested
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                loan:
 *                  type: object
 *                  properties:
 *                    loanReference:
 *                      type: string
 *                    isLoanApproved:
 *                      type: boolean
 *      400:
 *        description: Error occurred
 *
 */
router.put("/approveAndRequestConsent/:loanReference", isVerifiedClient, async (req, res) => {
  const { loanReference } = req.params;

  if(loanReference){
    try {
      await Loan.findOneAndUpdate({ loanReference }, {
        isLoanApproved: true,
        modifiedAt: Date.now()
      }).exec()

      const apiAdapter = new ApiAdapter();
      await apiAdapter.get()

      return res.status(200).json({
        message: "Loan successfully approved and consent created",
        loan: {
          loanReference,
          isLoanApproved: true,
        },
      });
    } catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }
  }
  return res.status(400).json({
    error: "Missing Loan Reference"
  });
});

/* PUT receive consented loan from Recova. */
/**
 * @openapi
 * '/updateConsent/:loanReference':
 *  put:
 *    tags:
 *      - Loan
 *    summary: Receive consented loan from Recova
 *    responses:
 *      200:
 *        description: Loan successfully updated
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                loan:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                    isConsentReceived:
 *                      type: boolean
 *      400:
 *        description: Error occurred
 *
 */
router.put("/updateConsent/:loanReference", isVerifiedClient, async (req, res) => {
  const { loanReference } = req.params;

  if(loanReference){
    try {
      await Loan.findOneAndUpdate({ loanReference }, {
        isConsentReceived: true,
        modifiedAt: Date.now()
      }).exec()

      return res.status(200).json({
        message: "Loan consent successfully updated",
        loan: {
          loanReference,
          isConsentReceived: true
        },
      });
    } catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }
  }
  return res.status(400).json({
    error: "Missing Loan Reference"
  });
});

export default router;
