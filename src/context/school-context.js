import { createContext, useContext } from 'react'

export const SchoolContext = createContext(null)

export const useSchool = () => useContext(SchoolContext)
