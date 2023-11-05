import express from "express";
const router = express.Router();
import { isVerifiedClient } from "../middlewares.js";
import Loan from "../models/loanModel.js";

/* POST receive approved loan from approval service. */
/**
 * @openapi
 * '/loan/receiveapproved':
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
 *              - loanId
 *            properties:
 *              loanId:
 *                type: string
 *                default: 123456789
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
 *                    id:
 *                      type: string
 *                    isConsentReceived:
 *                      type: boolean
 *      400:
 *        description: Error occurred
 *
 */
router.post("/receiveapproved", isVerifiedClient, async (req, res) => {
  const { loanId } = req.body;

  if(loanId){
    try {
      const loan = new Loan({ loanId });
      await loan.save();

      return res.status(201).json({
        message: "Loan successfully stored",
        loan: {
          id: loanId,
          isConsentReceived: false
        },
      });
    } catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }
  }
  return res.status(400).json({
    error: "Missing Loan Id"
  });
});

/* PUT receive consented loan from Recuva. */
/**
 * @openapi
 * '/loan/receiveconsent':
 *  put:
 *    tags:
 *      - Loan
 *    summary: Receive consented loan from Recuva
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - loanId
 *            properties:
 *              loanId:
 *                type: string
 *                default: 123456789
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
router.put("/receiveconsent", isVerifiedClient, async (req, res) => {
  const { loanId } = req.body;

  if(loanId){
    try {
      await Loan.findOneAndUpdate({ loanId }, {
        isConsentReceived: true,
        modifiedAt: Date.now()
      }).exec()

      return res.status(200).json({
        message: "Loan successfully updated",
        loan: {
          id: loanId,
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
    error: "Missing Loan Id"
  });
});

export default router;
