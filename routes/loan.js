import express from "express";
const router = express.Router();
import { isVerifiedClient } from "../middlewares.js";
import Loan from "../models/loanModel.js";

/* POST receive approved loan from approval service. */
router.post("/receiveapproved", isVerifiedClient, async (req, res) => {
  const { loanId } = req.body;

  if(loanId){
    try {
      const loan = new Loan({ loanId });
      await loan.save();

      res.status(201).json({
        message: "Loan successfully stored",
        loan: {
          id: loanId,
          isConsentReceived: false
        },
      });
    } catch (err) {
      res.status(400).json({
        error: err.message
      });
    }
  }
  return res.status(400).json({
    error: "Missing Loan Id"
  });
});

/* POST receive consented loan from Recuva. */
router.post("/receiveconsent", isVerifiedClient, async (req, res) => {
  const { loanId } = req.body;

  if(loanId){
    try {
      await Loan.findOneAndUpdate({ loanId }, {
        isConsentReceived: true,
        modifiedAt: Date.now()
      }).exec()

      res.status(201).json({
        message: "Loan successfully updated",
        loan: {
          id: loanId,
          isConsentReceived: true
        },
      });
    } catch (err) {
      res.status(400).json({
        error: err.message
      });
    }
  }
  return res.status(400).json({
    error: "Missing Loan Id"
  });
});

export default router;
