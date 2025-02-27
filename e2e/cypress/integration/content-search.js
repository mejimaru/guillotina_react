import {
  ITEMS_PANELS_SELECTORS,
  CONTEXT_TOOLBAR_SELECTORS,
} from '../elements/panels-selectors'
import { LOGIN_TYPES } from '../elements/login-selectors'

LOGIN_TYPES.forEach((loginType) => {
  describe('Search test', function () {
    beforeEach('clear', function () {
      cy.clearLocalStorage()
      cy.clearCookies()
      cy.login(loginType)

      cy.interceptGetObject('@canido')
      cy.interceptGetObject('@addable-types')

      cy.get(ITEMS_PANELS_SELECTORS.table)
        .should('contain', 'Groups')
        .should('contain', 'Users')
    })

    it('Creates a folder, item and GMI and search it', function () {
      cy.addContent('Test folder', 'test-folder', 'btnAddFolder')
      cy.addContent('second folder', 'second-folder', 'btnAddFolder')
      cy.addContent('first item', 'first-item', 'btnAddItem')
      cy.addContent('second item', 'second-item', 'btnAddItem')
      cy.addGMI('Test GMI item', 'test-gmi-item')

      cy.get(CONTEXT_TOOLBAR_SELECTORS.selectFilteType).select('Item')
      cy.get(ITEMS_PANELS_SELECTORS.table)
        .find('tbody')
        .find('tr')
        .its('length')
        .should('eq', 2)

      cy.get(CONTEXT_TOOLBAR_SELECTORS.selectFilteType).select('Folder')
      cy.get(ITEMS_PANELS_SELECTORS.table)
        .find('tbody')
        .find('tr')
        .its('length')
        .should('eq', 2)

      cy.get(CONTEXT_TOOLBAR_SELECTORS.selectFilteType).select('GMI')
      cy.get(ITEMS_PANELS_SELECTORS.table)
        .find('tbody')
        .find('tr')
        .its('length')
        .should('eq', 1)
    })

    it('Search items in first level', () => {
      cy.interceptGetObject('test-folder')
      cy.interceptGetObject('@search')

      cy.wait('@get-object-@addable-types')
      cy.wait('@get-object-@canido')

      cy.addContent('First item', 'first-item', 'btnAddItem')
      cy.addContent('Second Item', 'second-item', 'btnAddItem')
      cy.addContent('Test folder', 'test-folder', 'btnAddFolder')

      cy.get(
        `[data-test='${ITEMS_PANELS_SELECTORS.prefixItem}-test-folder']`
      ).click()
      cy.wait('@get-object-test-folder')
      cy.addContent(
        'First item in folder',
        'first-item-in-folder',
        'btnAddItem'
      )

      cy.visit(
        `/${Cypress.env('GUILLOTINA_DB')}/${Cypress.env(
          'GUILLOTINA_CONTAINER'
        )}/`
      )
      cy.wait('@get-object-@addable-types')
      cy.wait('@get-object-@canido')

      cy.get(CONTEXT_TOOLBAR_SELECTORS.selectFilteType).select('Item')
      cy.wait('@get-object-@search')
      cy.get(ITEMS_PANELS_SELECTORS.table)
        .find('tbody')
        .find('tr')
        .its('length')
        .should('eq', 2)
    })
  })
})
