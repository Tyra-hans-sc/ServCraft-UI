import React from 'react'
import { colors, layout} from '../../theme'
import { DateRangePicker } from "@progress/kendo-react-dateinputs";


export default function FilterDate({value}) {

  return (
    <div className="container">
      <DateRangePicker />
      <style jsx>{`
        .container {
          align-items: center;
          display: flex;
        }
      `}</style>
    </div>
  )
}


