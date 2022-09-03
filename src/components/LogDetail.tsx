import { RecorderLog } from "../utils/api";

export function LogDetail({ log }: { log: RecorderLog }) {
  var keys = Object.keys(log)
  return <div class='log-detail'>
    {
      keys.map((k) => {
        return (<>
          <div>{k}</div><div>{log[k]}</div>
        </>)
      })
    }
  </div>
}