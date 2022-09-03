import { RecorderLog } from "../utils/api";

export function LogDetail({ log }: { log: RecorderLog }) {
  var keys = Object.keys(log)
  return <div>
    {keys}
  </div>
}