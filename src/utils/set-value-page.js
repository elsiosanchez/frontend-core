import store from '@/store'
// Constants
// import { COLUMN_NAME, TABLE_NAME_CLIENT } from '@/utils/ADempiere/constants/resoucer.ts'
// Utils and Helper Methods
import getPageTitle from '@/utils/get-page-title'
// import { pathImageWindows } from '@/utils/ADempiere/resource'

function getPageFavicon({
  logo
}) {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
  }
  link.href = 'https://avatars.githubusercontent.com/u/54648828?s=200&v=4'
  document.head.appendChild(link)
  return link
}

// function getFaviconClient() {}
/**
 * Get System Information (System Logo and System Name)
 */
export function setSystemValues({
  routeName
}) {
  store.dispatch('user/system')
    .then(response => {
      const {
        name,
        logoUrl
      } = response
      // Set Page Title and Favicon
      document.title = getPageTitle({
        key: routeName,
        nameSystem: name
      })
      const link = getPageFavicon({ logo: logoUrl })
      document.head.appendChild(link)
    })
}

