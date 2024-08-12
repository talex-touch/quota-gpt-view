import { endHttp } from '../../axios'

export default {
  serverStatus() {
    return endHttp.get('auth/status')
  },
}
