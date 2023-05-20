import React from 'react'
import { DataItem } from '../interface/DataItemInterface'

interface Props {
  item: DataItem
  handleUpdateClick: (item: DataItem) => void
}

const Mytest = ({ item, handleUpdateClick }: Props) => {
  return (
    <div>
      <h2>{item.name}</h2>
      <img src={item.imageUrl} alt="" />
      <button onClick={item.onDelete}>Delete me!</button>
      <button onClick={() => handleUpdateClick(item)}>Update me!</button>
    </div>
  )
}

export default Mytest
