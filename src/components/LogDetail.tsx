import { RecorderLog } from '../utils/api';

export function LogDetail({ log }: { log: RecorderLog }) {
  const keys = Object.keys(log);
  return <div class='log-detail'>
    {
      keys.map((k) => {
        return (<>
          <div>{k}</div><div>{typeof log[k] === 'object' ? JSON.stringify(log[k]) : log[k]}</div>
        </>);
      })
    }
  </div>;
}
