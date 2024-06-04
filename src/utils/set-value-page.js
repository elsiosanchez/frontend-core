import store from '@/store'
// Constants
import { config } from '@/utils/ADempiere/config'
// Utils and Helper Methods
import getPageTitle from '@/utils/get-page-title'
import { getResourcePath } from '@/utils/ADempiere/resource'
import { isEmptyValue } from '@/utils/ADempiere'

function getPageFavicon({
  logo
}) {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
  }
  link.href = logo
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

/**
 * Get Session Information (Session Logo, User Logo and Session Name)
 */
export function setSessionValues({
  routeName
}) {
  const {
    client
  } = store.getters['user/getRole']
  const nameSystem = client ? client.name : ''
  // Set Page Title
  document.title = getPageTitle({
    key: routeName,
    nameSystem
  })

  if (isEmptyValue(client)) return
  getResourcePath({
    clientId: client.id,
    containerId: '109',
    containerType: 'resource',
    columnName: 'Logo_ID',
    recordId: client.id,
    tableName: 'AD_ClientInfo'
  })
    .then(response => {
      if (isEmptyValue(response)) return
      // Set Page Favicon
      const link = getPageFavicon({ logo: config.adempiere.resource.url + response })
      document.head.appendChild(link)
    })
}
