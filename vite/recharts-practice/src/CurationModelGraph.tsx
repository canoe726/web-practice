import { ChangeEvent, useEffect, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'

const CurationModelGraph = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvFileName, setCsvFileName] = useState<string>('')
  const [keyArray, setKeyArray] = useState<any>(null)
  const [csvArray, setCsvArray] = useState<any>(null)

  const transpose2dArray = (arr: any[][]) =>
    arr[0].map((_: any, colIdx: number) => arr.map((x: any[]) => x[colIdx]))

  const processCSV = (str: string, delim = ',') => {
    const colKeyArr = str.split('\n').map((item) => item.replace('\r', '').split(delim))
    return transpose2dArray(colKeyArr.slice(0, colKeyArr.length - 1))
  }

  useEffect(() => {
    if (csvFile) {
      setCsvArray(null)
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e && e.target) {
          const text = e.target.result as string
          const result = processCSV(text)
          let keyArr = []
          const keys = result.slice(0, 2)
          for (let i = 0; i < keys[0].length; i++) {
            keyArr.push(`${keys[0][i]}-${keys[1][i]}`)
          }
          setKeyArray(keyArr)
          setCsvArray(result.slice(2))
        }
      }
      reader.readAsText(csvFile)
      setCsvFileName(csvFile.name.slice(0, csvFile.name.length - 4))
    }
  }, [csvFile])

  return (
    <div className="p-4">
      <div className="flex justify-items-center items-center">
        <div className="text-xl mx-2 font-bold">CSV 파일 선택</div>
        <input className="border-2 rounded-lg p-1" type="file" accept=".csv" name="csv-reader"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
              setCsvFile(e.target.files[0])
            }
          }}
        ></input>
      </div>
      {csvArray && (
        <RenderLineChart
          title={csvFileName}
          keys={keyArray}
          data={csvArray}
        ></RenderLineChart>
      )}
    </div>
  )
}

interface RenderLineChartProps {
  title: string;
  keys: string[];
  data: any[][];
}

const RenderLineChart: React.FC<RenderLineChartProps> = ({
  title,
  keys,
  data
}) => {
  const colors = scaleOrdinal(schemeCategory10).range();
  const chartWrapperRef = useRef<HTMLDivElement>(null)
  const [prevRadioSelectedIdx, setPrevRadioSelectedIdx] = useState<number>(-1)
  const [selectedKeys, setSelectedKeys] = useState<boolean[]>(Array.from({ length: keys.length }, () => false))
  const [filteredData, setFilteredData] = useState<{ name: string, value: any }[]>([])
  const [selectedCellData, setSelectedCellData] = useState<any[][]>([])

  return (
    <div ref={chartWrapperRef} className="flex flex-col items-center justify-items-center">
      <h1 className="text-3xl font-bold underline text-center p-4">
        {`${title} 현황`}
      </h1>
      <div className="block border-2 rounded-lg w-full h-40 px-6 py-2 mb-2 overflow-y-scroll">
        <fieldset id="filter-group">
          {keys.map((key: string, idx: number) => {
            return (
              <div key={idx} className="flex items-center justify-items-center w-fit my-3">
                <input className="w-6 h-6" type="radio" name="filter-group"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    selectedKeys[prevRadioSelectedIdx] = false
                    selectedKeys[idx] = e.target.checked
                    setSelectedKeys(selectedKeys)
                    setPrevRadioSelectedIdx(idx)
                    setSelectedCellData([])

                    const filtered: string[] = data.map(item => item.filter((_, idx) => selectedKeys[idx])).flat()
                    const counts: { [key: string]: number } = {}
                    filtered.forEach((x: string) => {
                      counts[x] = (counts[x] || 0) + 1
                    })
                    const sortedCounts = Object.entries(counts)
                      .sort(([key1, value1], [key2, value2]) => {
                        if (value1 === value2) {
                          return key1 > key2 ? 1 : -1
                        } else {
                          return value1 - value2
                        }
                      })
                      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
                    setFilteredData(Object.entries(sortedCounts).map(([key, value]) => {
                      return {
                        name: key,
                        value: value
                      }
                    }))
                  }}
                ></input>
                <div className="px-2">{key}</div>
              </div>
            )
          })}
        </fieldset>
      </div>
      <ResponsiveContainer width="100%" height={550}>
        <BarChart className="bg-gray-100" data={filteredData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#82ca9d">
            {data.map((_, index) => {
              return <Cell key={`cell-${index}`} fill={colors[index % 10]} 
                onClick={() => {
                  const value = Object.values(filteredData)[index]
                  setSelectedCellData(data.filter((item) => (item[prevRadioSelectedIdx] === value.name)))
                }}/>
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {selectedCellData.length > 0 && (
        <div className="my-4 w-full h-80 overflow-scroll">
          <table className="relative whitespace-nowrap" cellSpacing='10' cellPadding='10'>
            <thead className="sticky top-0">
              <tr>
                {keys.map((key, idx) => {
                  return (
                    <th key={idx} className="border-2 bg-blue-100">{key}</th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {selectedCellData.map((data, dataIdx) => {
                return (
                  <tr key={dataIdx}>
                    {data.map((item, itemIdx) => {
                      return (
                        <td key={itemIdx} className="border-2">{item}</td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CurationModelGraph
