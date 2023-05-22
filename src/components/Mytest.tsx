import React from 'react'
import { DataItem } from '../interface/DataItemInterface'

interface Props {
  item: DataItem
  handleUpdateClick: (item: DataItem) => void
  setSelectedFile: (file: File | null) => void // Add this prop
}

const Mytest = ({ item, handleUpdateClick, setSelectedFile }: Props) => {
  return (
    <>
      {/* <div className="flex flex-col bg-slate-300">
       
        <h2>{item.name}</h2>
        <h2>{item.github}</h2>
        <h2>{item.live}</h2>

        
        <button onClick={() => handleUpdateClick(item)}>Update me!</button>
      </div> */}
      <div className="flex flex-col">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full text-center text-sm font-light">
                <thead className="border-b font-medium dark:border-neutral-500">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      className
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Heading
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Heading
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-neutral-500">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      <img src={item.imageUrl} alt="" />
                      {/* <input
                        type="file"
                        name=""
                        id=""
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                      /> */}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      {' '}
                      <h2>{item.name}</h2>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {' '}
                      <h2>{item.github}</h2>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {' '}
                      <h2>{item.live}</h2>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {' '}
                      <button onClick={item.onDelete}>Delete me!</button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {' '}
                      <button onClick={() => handleUpdateClick(item)}>
                        Update me!
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Mytest
