/**
 * @typedef {Object} RedirectURI
 * @property {string} type - The type of redirect URI (e.g., "Strict" or "Regex").
 * @property {string} path - The path for the redirect URI.
 */

/**
 * @typedef {Object} FormData
 * @property {string} integrationName
 * @property {string} integrationDomain
 * @property {boolean} isSaas
 * @property {string} domain
 * @property {string} supportLevel
 * @property {string} description
 * @property {string} webLink
 * @property {string} providerType
 * @property {boolean} isPublicClient
 * @property {RedirectURI[]} redirectURIs
 * @property {string[]} additionalScopes
 * @property {string} subjectMode
 */

/**
 * Initializes the document by attaching event listeners and prepopulating
 * the form if configuration data is found in the URL.
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const dataB64 = params.get('data_b64');
    if (dataB64) {
      const config = decodeConfig(dataB64);
      if (config) {
        prepopulateForm(config);
      }
    } else {
      addRedirectURI();
      addScope();
    }
  
    const form = document.getElementById('docsGeneratorForm');
    form.addEventListener('submit', handleFormSubmit);
  
    document.getElementById('addRedirectURI').addEventListener('click', () => addRedirectURI());
    document.getElementById('addScope').addEventListener('click', () => addScope());
    document.getElementById('shareConfig').addEventListener('click', shareConfiguration);
  });
  
  /**
   * Handles the form submission event by validating the form, generating the markdown,
   * and outputting the result.
   *
   * @param {Event} event - The form submission event.
   */
  function handleFormSubmit(event) {
    event.preventDefault();
  
    const requiredFields = ['integrationName', 'integrationDomain', 'description', 'webLink'];
    for (let fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        alert(`Please fill in the ${field.previousElementSibling.textContent}`);
        field.focus();
        return;
      }
    }
  
    const redirectURIRows = document.querySelectorAll('.redirect-uri-row');
    if (redirectURIRows.length === 0) {
      alert('Please add at least one Redirect URI.');
      return;
    }
    for (let row of redirectURIRows) {
      const uriInput = row.querySelector('.uri-input');
      if (!uriInput.value.trim()) {
        alert('Please fill in all Redirect URI fields.');
        uriInput.focus();
        return;
      }
    }
  
    const markdown = generateMarkdown(getFormData());
    document.getElementById('output').textContent = markdown.trim();
  }
  
  /**
   * Collects and returns data from the form.
   *
   * @returns {FormData} The collected form data.
   */
  function getFormData() {
    const integrationName = document.getElementById('integrationName').value.trim();
    const integrationDomain = document.getElementById('integrationDomain').value.trim();
    const isSaas = document.getElementById('isSaas').checked;
    const domain = isSaas ? integrationDomain : integrationDomain + '.company';
    const supportLevel = document.getElementById('supportLevel').value.toLowerCase();
    const description = document.getElementById('description').value.trim();
    const webLink = document.getElementById('webLink').value.trim();
    const providerType = document.getElementById('providerType').value;
    const isPublicClient = document.getElementById('isPublicClient').checked;
    const subjectMode = document.getElementById('subjectMode').value;
  
    const redirectURIs = Array.from(document.querySelectorAll('.redirect-uri-row')).map(row => {
      return {
        type: row.querySelector('.uri-type').value,
        path: row.querySelector('.uri-input').value.trim()
      };
    });
  
    const additionalScopes = Array.from(document.querySelectorAll('.scope-input'))
      .map(input => input.value.trim())
      .filter(scope => scope !== '');
  
    return {
      integrationName,
      integrationDomain,
      isSaas,
      domain,
      supportLevel,
      description,
      webLink,
      providerType,
      isPublicClient,
      redirectURIs,
      additionalScopes,
      subjectMode
    };
  }
  
  /**
   * Generates markdown content based on the provided form data.
   *
   * @param {FormData} data - The form data.
   * @returns {string} The generated markdown content.
   */
  function generateMarkdown(data) {
    const clientNote = data.isPublicClient
      ? 'Note the **Client ID** value because it will be required later.'
      : 'Note the **Client ID** and **Client Secret** values because they will be required later.';
  
    let redirectURIMarkdown = '';
    if (data.redirectURIs.length === 1) {
      const uri = data.redirectURIs[0];
      redirectURIMarkdown = `Set a **${uri.type}** redirect URI to <kbd>https://<em>${data.domain}</em>${uri.path}</kbd>.`;
    } else if (data.redirectURIs.length > 1) {
      redirectURIMarkdown = 'Set the following redirect URIs:\n';
      redirectURIMarkdown += data.redirectURIs.map(uri =>
        `- **${uri.type}**: <kbd>https://<em>${data.domain}</em>${uri.path}</kbd>`
      ).join('\n');
    }
  
    let advancedProtocolBullet = '';
    if (data.additionalScopes.length === 1) {
      advancedProtocolBullet = `Under **Advanced Protocol Settings**, add \`${data.additionalScopes[0]}\` to the list of available scopes.`;
    } else if (data.additionalScopes.length > 1) {
      const scopesList = data.additionalScopes.map(s => `\`${s}\``).join(', ');
      advancedProtocolBullet = `Under **Advanced Protocol Settings**, add the following scopes to the list of available scopes: ${scopesList}.`;
    }
  
    const subjectModeBullet = data.subjectMode
      ? `Under **Advanced Protocol Settings**, set **Subject mode** to be \`${data.subjectMode}\`.`
      : '';
  
    return `---
  title: Integrate with ${data.integrationName}
  sidebar_label: ${data.integrationName}
  support_level: ${data.supportLevel}
  ---
  
  ## What is ${data.integrationName}
  
  > ${data.description}
  > 
  > -- ${data.webLink}
  
  ## Preparation
  
  The following placeholders are used in this guide:
  - \`${data.domain}\` is the FQDN of the ${data.integrationName} installation.
  - \`authentik.company\` is the FQDN of the authentik installation.
  
  :::note
  This documentation lists only the settings that you need to change from their default values. Be aware that any changes other than those explicitly mentioned in this guide could cause issues accessing your application.
  :::
  
  ## authentik configuration
  
  To support the integration of ${data.integrationName} with authentik, you need to create an application/provider pair in authentik.
  
  ### Create an application and provider in authentik
  
  1. Log in to authentik as an admin, and open the authentik Admin interface.
  2. Navigate to **Applications** > **Applications** and click **Create with Provider** to create an application and provider pair. (Alternatively, you can create only an application, without a provider, by clicking **Create**.)
  
  - **Application**: Provide a descriptive name, an optional group for the type of application, the policy engine mode, and optional UI settings.
  - **Choose a Provider type**: Select **OAuth2/OpenID Connect** as the provider type.
  - **Configure the Provider**: Provide a name (or accept the auto-provided name), choose the authorization flow for this provider, and configure the following required settings:
    - ${clientNote}
    - ${redirectURIMarkdown}
  ${advancedProtocolBullet ? `- ${advancedProtocolBullet}\n` : ''}${subjectModeBullet ? `- ${subjectModeBullet}` : ''}
  - **Configure Bindings** _(optional)_: Create a [binding](/docs/add-secure-apps/flows-stages/bindings/) (policy, group, or user) to manage the listing and access to applications on a user's **My applications** page.
  
  3. Click **Submit** to save the new application and provider.
  `;
  }
  
  /**
   * Builds and prompts a shareable configuration link
   */
  function shareConfiguration() {
    const config = getFormData();
    fetch('https://dominic-r.github.io/ak-gendoc/version.json')
      .then(response => response.json())
      .then(versionData => {
        const version = versionData.version || '1.0';
        const encodedData = encodeConfig(config);
        const baseUrl = window.location.origin + window.location.pathname.replace(/index\.html$/, '');
        const shareLink = baseUrl + 's.html?_ver=' + version +
          '&data_b64=' + encodeURIComponent(encodedData);
        prompt('Shareable Link:', shareLink);
      })
      .catch(err => {
        console.error(err);
        alert('Error generating shareable link. Please try again later.');
      });
  }
  
  /**
   * Prepopulates the form fields with the provided configuration data.
   *
   * @param {FormData} config - The configuration data used to prepopulate the form.
   */
  function prepopulateForm(config) {
    document.getElementById('integrationName').value = config.integrationName || '';
    document.getElementById('integrationDomain').value = config.integrationDomain || '';
    document.getElementById('supportLevel').value = config.supportLevel || 'community';
    document.getElementById('description').value = config.description || '';
    document.getElementById('webLink').value = config.webLink || '';
    document.getElementById('providerType').value = config.providerType || 'oidc';
    document.getElementById('isPublicClient').checked = !!config.isPublicClient;
    document.getElementById('isSaas').checked = !!config.isSaas;
    document.getElementById('subjectMode').value = config.subjectMode || '';
  
    const redirectContainer = document.getElementById('redirectURIsContainer');
    redirectContainer.innerHTML = '';
    if (config.redirectURIs && config.redirectURIs.length > 0) {
      config.redirectURIs.forEach(uri => {
        addRedirectURI(uri);
      });
    } else {
      addRedirectURI();
    }
  
    const scopesContainer = document.getElementById('scopesContainer');
    scopesContainer.innerHTML = '';
    if (config.additionalScopes && config.additionalScopes.length > 0) {
      config.additionalScopes.forEach(scope => {
        addScope(scope);
      });
    } else {
      addScope();
    }
  }
  
  /**
   * Adds a new redirect URI input row to the form.
   *
   * @param {RedirectURI} [existingData] - Optional existing data to prepopulate the redirect URI row.
   */
  function addRedirectURI(existingData) {
    const container = document.getElementById('redirectURIsContainer');
    const row = document.createElement('div');
    row.className = 'redirect-uri-row row-item';
  
    const select = document.createElement('select');
    select.className = 'uri-type';
    const optionStrict = document.createElement('option');
    optionStrict.value = 'Strict';
    optionStrict.textContent = 'Strict';
    const optionRegex = document.createElement('option');
    optionRegex.value = 'Regex';
    optionRegex.textContent = 'Regex';
    select.appendChild(optionStrict);
    select.appendChild(optionRegex);
  
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'uri-input';
    input.placeholder = '/oauth/callback';
    if (existingData && existingData.path) {
      input.value = existingData.path;
    }
  
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '–';
    removeBtn.title = 'Remove this Redirect URI';
    removeBtn.addEventListener('click', () => {
      container.removeChild(row);
    });
  
    row.appendChild(select);
    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);
  
    if (existingData && existingData.type) {
      select.value = existingData.type;
    }
  }
  
  /**
   * Adds a new scope input row to the form.
   *
   * @param {string} [existingValue] - Optional initial scope value to prepopulate the scope input.
   */
  function addScope(existingValue) {
    const container = document.getElementById('scopesContainer');
    const row = document.createElement('div');
    row.className = 'scope-row row-item';
  
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'scope-input';
    input.placeholder = 'e.g., custom_scope';
    if (existingValue) {
      input.value = existingValue;
    }
  
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '–';
    removeBtn.title = 'Remove this Scope';
    removeBtn.addEventListener('click', () => {
      container.removeChild(row);
    });
  
    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }
  