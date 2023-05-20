import React from 'react'
import { DataItem } from '../interface/DataItemInterface'

interface Props {
  item: DataItem
}

const Mytest = ({ item }: Props) => {
  return (
    <div>
      <h2>{item.name}</h2>
      <img src={item.imageUrl} alt="" />
      <button onClick={item.onDelete}>delete me!</button>
      <button>update me!</button>
    </div>
  )
}

export default Mytest
