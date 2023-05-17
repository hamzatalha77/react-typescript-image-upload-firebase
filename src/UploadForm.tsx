import React, { useState } from 'react'
import { storage } from './config/firebase'
import { ref } from 'firebase/storage'
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

  const handleUpload = () => {
    if (file) {
      const storageRef = storage.ref()
      const fileRef = storageRef.child(file.name)
      const uploadTask = fileRef.put(file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
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
