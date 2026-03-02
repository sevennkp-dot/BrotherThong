import express from "express";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY"
);

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (let event of events) {
    if (event.type === "message" && event.message.type === "text") {

      const userId = event.source.userId;
      const text = event.message.text;

      // บันทึกลง Supabase
      await supabase.from("line_chat").insert([
        { user_id: userId, message: text }
      ]);

      // ตอบกลับ
      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: "บันทึกข้อมูลเรียบร้อย ✅" }]
        },
        {
          headers: {
            Authorization: `Bearer CHANNEL_ACCESS_TOKEN`
          }
        }
      );
    }
  }

  res.sendStatus(200);
});

app.listen(3000);
