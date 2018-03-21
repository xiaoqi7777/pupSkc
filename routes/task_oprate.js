const router = require("koa-router")();
const config = require("config");
import { start_task} from "../lib/transcoder.js";

router.prefix('/api/v1/task_oprate');


router.post("/send_task", async (ctx, next) => {
  let task_json = ctx.request.body.task_json;
  let ti = await start_task(config.transcoder.host, config.transcoder.port, task_json);
  ctx.body = ti;
});


module.exports = router