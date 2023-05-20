import React from 'react'
import { DataItem } from '../interface/DataItemInterface'

interface Props {
  item: DataItem
  handleUpdateClick: (item: DataItem) => void // Add this prop
}

const Mytest = ({ item, handleUpdateClick }: Props) => {
  return (
    <div>
      <img src={item.imageUrl} alt="" />
      <h2>{item.name}</h2>
      <button onClick={item.onDelete}>Delete me!</button>
      <button onClick={() => handleUpdateClick(item)}>Update me!</button>
    </div>
  )
}
export default Mytest
