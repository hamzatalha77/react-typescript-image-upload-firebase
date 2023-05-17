import React, { useState } from 'react'
import { storage } from './config/firebase'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage'

const UploadForm: React.FC = () => {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (file) {
      const storageRef = getStorage()
      const fileRef = ref(storageRef, file.name)
      const uploadTask = uploadBytesResumable(fileRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const uploadProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(uploadProgress)
        },
        (error) => {
          console.error('Error uploading file: ', error)
        },
        () => {
          console.log('File uploaded successfully.')
        }
      )

      await uploadTask
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={handleNameChange}
      />
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {progress > 0 && <progress value={progress} max={100} />}
    </div>
  )
}

export default UploadForm
