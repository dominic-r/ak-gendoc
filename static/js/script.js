document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('docsGeneratorForm');
    form.addEventListener('submit', handleFormSubmit);
  
    // Initialize dynamic sections with one default row each
    addRedirectURI(); 
    addScope(); 
  
    // Attach event listeners for dynamic add buttons
    document.getElementById('addRedirectURI').addEventListener('click', addRedirectURI);
    document.getElementById('addScope').addEventListener('click', addScope);
  });
  
  function handleFormSubmit(event) {
    event.preventDefault();
  
    // Validate required fields
    const requiredFields = ['integrationName', 'integrationDomain', 'description', 'webLink'];
    for (let fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        alert(`Please fill in the ${field.previousElementSibling.textContent}`);
        field.focus();
        return;
      }
    }
  
    // Validate at least one redirect URI is provided and non-empty
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
  
    // Get form values
    const integrationName = document.getElementById('integrationName').value.trim();
    const deploymentType = document.getElementById('deploymentType').value;
    const integrationDomain = document.getElementById('integrationDomain').value.trim();
    // Compute full domain based on deployment type
    const domain = deploymentType === 'company' ? integrationDomain + '.company' : integrationDomain;
    const supportLevel = document.getElementById('supportLevel').value.toLowerCase();
    const description = document.getElementById('description').value.trim();
    const webLink = document.getElementById('webLink').value.trim();
    const providerType = document.getElementById('providerType').value;
    const isPublicClient = document.getElementById('isPublicClient').checked;
  
    // Gather redirect URIs data
    const redirectURIs = Array.from(document.querySelectorAll('.redirect-uri-row')).map(row => {
      return {
        type: row.querySelector('.uri-type').value,
        path: row.querySelector('.uri-input').value.trim()
      };
    });
  
    // Gather additional scopes (filter out empty entries)
    const additionalScopes = Array.from(document.querySelectorAll('.scope-input'))
      .map(input => input.value.trim())
      .filter(scope => scope !== '');
  
    const markdown = generateMarkdown({
      integrationName,
      domain,
      supportLevel,
      description,
      webLink,
      providerType,
      isPublicClient,
      redirectURIs,
      additionalScopes
    });
  
    document.getElementById('output').textContent = markdown.trim();
  }
  
  function generateMarkdown({
    integrationName,
    domain,
    supportLevel,
    description,
    webLink,
    providerType,
    isPublicClient,
    redirectURIs,
    additionalScopes
  }) {
    // Build client note without a leading dash
    const clientNote = isPublicClient
      ? 'Note the **Client ID** value because it will be required later.'
      : 'Note the **Client ID** and **Client Secret** values because they will be required later.';
  
    // Generate redirect URI markdown bullet
    let redirectURIMarkdown = '';
    if (redirectURIs.length === 1) {
      const uri = redirectURIs[0];
      redirectURIMarkdown = `Set a **${uri.type}** redirect URI to <kbd>https://<em>${domain}</em>${uri.path}</kbd>.`;
    } else if (redirectURIs.length > 1) {
      redirectURIMarkdown = 'Set the following redirect URIs:\n';
      redirectURIMarkdown += redirectURIs.map(uri =>
        `  - **${uri.type}**: <kbd>https://<em>${domain}</em>${uri.path}</kbd>`
      ).join('\n');
    }
  
    // Generate advanced protocol settings bullet (only if scopes are added)
    let advancedProtocolBullet = '';
    if (additionalScopes.length === 1) {
      advancedProtocolBullet = `Under **Advanced Protocol Settings**, add \`${additionalScopes[0]}\` to the list of available scopes.`;
    } else if (additionalScopes.length > 1) {
      const scopesList = additionalScopes.map(s => `\`${s}\``).join(', ');
      advancedProtocolBullet = `Under **Advanced Protocol Settings**, add the following scopes to the list of available scopes: ${scopesList}.`;
    }
  
    return `---
  title: Integrate with ${integrationName}
  sidebar_label: ${integrationName}
  support_level: ${supportLevel}
  ---
  
  ## What is ${integrationName}
  
  > ${description}
  > 
  > -- ${webLink}
  
  ## Preparation
  
  The following placeholders are used in this guide:
  - \`${domain}\` is the FQDN of the ${integrationName} installation.
  - \`authentik.company\` is the FQDN of the authentik installation.
  
  :::note
  This documentation lists only the settings that you need to change from their default values. Be aware that any changes other than those explicitly mentioned in this guide could cause issues accessing your application.
  :::
  
  ## authentik configuration
  
  To support the integration of ${integrationName} with authentik, you need to create an application/provider pair in authentik.
  
  ### Create an application and provider in authentik
  
  1. Log in to authentik as an admin, and open the authentik Admin interface.
  2. Navigate to **Applications** > **Applications** and click **Create with Provider** to create an application and provider pair. (Alternatively, you can create only an application, without a provider, by clicking **Create**.)
  
  - **Application**: Provide a descriptive name, an optional group for the type of application, the policy engine mode, and optional UI settings.
  - **Choose a Provider type**: Select **OAuth2/OpenID Connect** as the provider type.
  - **Configure the Provider**: Provide a name (or accept the auto-provided name), choose the authorization flow for this provider, and configure the following required settings:
    - ${clientNote}
    - ${redirectURIMarkdown}
  ${advancedProtocolBullet ? `  - ${advancedProtocolBullet}` : ''}
  - **Configure Bindings** _(optional)_: Create a [binding](/docs/add-secure-apps/flows-stages/bindings/) (policy, group, or user) to manage the listing and access to applications on a user's **My applications** page.
  
  3. Click **Submit** to save the new application and provider.
  `;
  }
  
  // --- Dynamic Redirect URI Rows ---
  function addRedirectURI() {
    const container = document.getElementById('redirectURIsContainer');
    const row = document.createElement('div');
    row.className = 'redirect-uri-row row-item';
  
    // Create select for Strict/Regex
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
  
    // Create input for URI path
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'uri-input';
    input.placeholder = '/oauth/callback';
  
    // Create remove button
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
  }
  
  // --- Dynamic Additional Scope Rows ---
  function addScope() {
    const container = document.getElementById('scopesContainer');
    const row = document.createElement('div');
    row.className = 'scope-row row-item';
  
    // Create input for scope
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'scope-input';
    input.placeholder = 'e.g., custom_scope';
  
    // Create remove button
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
  