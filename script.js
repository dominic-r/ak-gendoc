function generateMarkdown() {
    const integrationName = document.getElementById('integrationName').value;
    const supportLevel = document.getElementById('supportLevel').value;
    const description = document.getElementById('description').value;
    const webLink = document.getElementById('webLink').value;

    const markdownTemplate = `---
title: Integrate with ${integrationName}
sidebar_label: ${integrationName}
---

# Integrate with ${integrationName}

<span class="badge badge--secondary">Support level: ${supportLevel}</span>

## What is ${integrationName}

> ${description}
> 
> -- [${integrationName}](${webLink})
`;

    const output = document.getElementById('output');
    output.textContent = markdownTemplate;
}
