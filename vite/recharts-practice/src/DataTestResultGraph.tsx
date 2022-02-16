import { useCallback, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'

export interface ResultValue {
  average: number;
  success: number;
  total: number;
}

export interface DataResult {
  testsetTitle: string; 
  configTitle: string;
  testResultAverage: number;
  testResultNumOfSuccess: number;
  testResultNumOfTotal: number;
  execTime: number;
  createdAt: string;
}

interface DataTestResultGraphProps {
  data: DataResult[];
  showDataKeys: string[];
}

interface DataKey {
  key: string;
  active: boolean;
}

const DataTestResultGraph: React.FC<DataTestResultGraphProps> = ({
  data,
  showDataKeys
}) => {
  const colors = scaleOrdinal(schemeCategory10).range();
  const [isActiveKey, setIsActiveKey] = useState<boolean[]>(Array.from({length: showDataKeys.length}, () => true))
  const [, updateState] = useState<Object>();
  const forceUpdate = useCallback(() => updateState({}), []);

  return (
    <div className="p-8">
      <ResponsiveContainer width="100%" height={600}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="configTitle" />
          <YAxis />
          <Tooltip />
          <Legend onClick={(e) => {
            const idx = showDataKeys.indexOf(e.value)
            isActiveKey[idx] = !isActiveKey[idx]
            setIsActiveKey(isActiveKey)
            forceUpdate()
          }}/>
          {showDataKeys.map((dataKey, idx) => {
            return (
              <Line
                key={idx}
                display={isActiveKey[idx] ? 'block' : 'none'}
                type="monotone"
                dataKey={dataKey}
                stroke={colors[idx]}
                strokeWidth="2" />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DataTestResultGraph
