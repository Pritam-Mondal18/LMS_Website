const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    academyName: { type: String, default: "Sumit Chakraborty Academy" },
    supportEmail: { type: String, default: "support@sumitchakrabortyacademy.com" },
    supportPhone: { type: String, default: "+91 98300 98300" },
    smtpHost: { type: String, default: "smtp.gmail.com" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "pritam18official@gmail.com" },
    smtpPass: { type: String, default: "" },
    enableRegister: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
