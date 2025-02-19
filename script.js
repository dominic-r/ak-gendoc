function generateMarkdown() {
    const integrationName = document.getElementById('integrationName').value;
    const integrationDomain = document.getElementById('integrationDomain').value;
    const supportLevel = document.getElementById('supportLevel').value.toLowerCase();
    const description = document.getElementById('description').value;
    const webLink = document.getElementById('webLink').value;
    const providerType = document.getElementById('providerType').value;
    const callbackPath = document.getElementById('callbackPath').value;
    const isPublicClient = document.getElementById('isPublicClient').checked;

    const markdownTemplate = `---
title: Integrate with ${integrationName}
sidebar_label: ${integrationName}
---

# Integrate with ${integrationName}

<span class="badge badge--secondary">Support level: ${supportLevel}</span>

## What is ${integrationName}

> ${description}
> 
> -- ${webLink}

## Preparation

The following placeholders are used in this guide:

- \`${integrationDomain}.company\` is the FQDN of ${integrationName} installation.
- \`authentik.company\` is the FQDN of authentik installation.

:::note
This documentation lists only the settings that you need to change from their default values. Be aware that any changes other than those explicitly mentioned in this guide could cause issues accessing your application.
:::

## authentik configuration

To support the integration of ${integrationName} with authentik, you need to create an application/provider pair in authentik.

### Create an application and provider in authentik

1. Log in to authentik as an admin, and open the authentik Admin interface.
2. Navigate to **Applications** > **Applications** and click **Create with Provider** to create an application and provider pair. (Alternatively you can create only an application, without a provider, by clicking **Create**.)

- **Application**: provide a descriptive name, an optional group for the type of application, the policy engine mode, and optional UI settings.
- **Choose a Provider type**: select **OAuth2/OpenID Connect** as the provider type.
- **Configure the Provider**: provide a name (or accept the auto-provided name), the authorization flow to use for this provider, and the following required configurations.${!isPublicClient ? '\n    - Note the **Client ID** and **Client Secret** values because they will be required later.' : '\n    - Note the **Client ID** value because it will be required later.'}
    - Set a \`Strict\` redirect URI to <kbd>https://<em>${integrationDomain}.company</em>${callbackPath}</kbd>.
    - Select any available signing key.
- **Configure Bindings** _(optional)_: you can create a [binding](/docs/add-secure-apps/flows-stages/bindings/) (policy, group, or user) to manage the listing and access to applications on a user's **My applications** page.

3. Click **Submit** to save the new application and provider.`;

    const output = document.getElementById('output');
    output.textContent = markdownTemplate;
}
