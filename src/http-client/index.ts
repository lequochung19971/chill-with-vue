import axios from 'axios'
import { stringify } from 'qs'

const httpClient = axios.create({
  baseURL: 'http://localhost:8000',
  paramsSerializer: (params) => {
    return stringify(params)
  }
})

export default httpClient
