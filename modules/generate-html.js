/* eslint-disable no-undef */
/* ----------------------------------------------------------------
 * generate html
-----------------------------------------------------------------*/
export const generateHTML = async (config, tags) => {
  try {
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OptimizeImage - image snippet for HTML</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vanilla-datatables@latest/dist/vanilla-dataTables.min.css">
  <script src="https://cdn.jsdelivr.net/npm/vanilla-datatables@latest/dist/vanilla-dataTables.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/monokai.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <style>
    body {font-family: 'Inter', sans-serif;}
    .dataTable-input,.dataTable-selector {@apply border border-gray-300 rounded px-2 py-1;}
    .dataTable-pagination a {@apply px-2 py-1 mx-1 bg-gray-200 rounded;}
    .dataTable-pagination a.active {@apply bg-blue-500 text-white;}
    #imageViewer {display: flex;flex-direction: column;}
    #imageViewer img,#imageViewer picture{display: block;object-fit: cover;width: 100%;height: 100%;}
    .dataTable-container {height: calc(98% - 40px) !important;overflow-y: auto;}
    .dataTable-container thead{display: none;}
    .dataTable-top{padding: 0;}
    .dataTable-bottom {margin-top: auto;position: absolute;bottom: 0;left:0;right:0;margin-inline: auto;}
    .search-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body class="bg-gray-100">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-semibold text-center mb-8">OptimizeImage Snippets</h1>
    <div id="imageViewer" class="bg-white rounded-lg shadow-lg p-6 mx-auto relative" style="height: 80vh; max-width: 800px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Image Viewer</h2>
        <div class="flex items-center space-x-4">
          <select id="perPage" class="dataTable-selector">
            <option value="5">5 per page</option>
            <option value="10" selected>10 per page</option>
            <option value="15">15 per page</option>
            <option value="20">20 per page</option>
          </select>
          <button id="sortByName" class="px-3 py-1 bg-blue-500 text-white rounded">Sort by Name</button>
        </div>
      </div>
      <div class="dataTable-container">
        <table id="snippetsTable" class="w-full">
          <tbody>
            <!-- Table content will be dynamically populated -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="codeModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 id="modalTitle" class="text-xl font-semibold"></h3>
        <button id="closeModal" class="text-gray-500 hover:text-gray-700">&times;</button>
      </div>
      <pre><code id="codeContent" class="language-html"></code></pre>
      <div class="mt-4 flex justify-end">
        <button id="copyCode" class="px-4 py-2 bg-blue-500 text-white rounded">Copy Code</button>
      </div>
    </div>
  </div>

  <div id="copyNotification" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 opacity-0">
    Code copied to clipboard!
  </div>

  <script>
    const tableData = [
      ${tags.map((tag) => `{ image: \`${tag.code.replaceAll(config.snippetsOption.path, config.snippetsOption.public + config.snippetsOption.path)}\`, name: '${tag.name}', code: \`${tag.code}\` },`).join('\n')}
    ];

    const snippetsTable = document.getElementById('snippetsTable');
    const codeModal = document.getElementById('codeModal');
    const modalTitle = document.getElementById('modalTitle');
    const codeContent = document.getElementById('codeContent');
    const closeModal = document.getElementById('closeModal');
    const copyCode = document.getElementById('copyCode');
    const sortByNameBtn = document.getElementById('sortByName');
    const copyNotification = document.getElementById('copyNotification');
    const perPageSelect = document.getElementById('perPage');
    let isAscending = true;
    let dataTable;

    function populateTable() {
            snippetsTable.innerHTML = \`
                <tbody>
                    \${tableData.map(item => \`
                        <tr class="bg-gray-100 hover:bg-gray-200 cursor-pointer">
                            <td class="p-3 flex items-center justify-between">
                                <div class="flex items-center">
                                  <span class="w-16 h-16 object-cover rounded mr-4">\${item.image}</span>
                                  <span>\${item.name}</span>
                                </div>
                                <button class="copy-btn px-3 py-1 bg-blue-500 text-white rounded" data-code="\${encodeURIComponent(item.code)}">
                                    Copy Code
                                </button>
                            </td>
                        </tr>
                    \`).join('')}
                </tbody>
            \`;
        }

    function positionSearchInput() {
      const searchInput = document.querySelector('.dataTable-input');
      if (searchInput) {
        const searchContainer = document.createElement('div');
        searchContainer.classList.add('search-container', 'fixed', 'top-4', 'right-4');
        
        // Create All Copy button
        const allCopyBtn = document.createElement('button');
        allCopyBtn.id = 'allCopyBtn';
        allCopyBtn.classList.add('px-3', 'py-1', 'bg-blue-500', 'text-white', 'rounded');
        allCopyBtn.textContent = 'All Copy';
        
        // Get the parent of the search input
        const parent = searchInput.parentNode;
        
        // Move the search input to our new container
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(allCopyBtn);
        
        // Add the new container to the parent
        parent.appendChild(searchContainer);
        
        // Add event listener to All Copy button
        allCopyBtn.addEventListener('click', copyAllSnippets);
      }
    }

    function copyAllSnippets() {
      // Get all visible rows in the current view (handles filtered results too)
      const visibleRows = Array.from(document.querySelectorAll('#snippetsTable tbody tr:not(.dataTable-hidden)'));
      
      if (visibleRows.length === 0) {
        alert('No snippets to copy');
        return;
      }
      
      // Extract code from each visible row
      const allCodes = visibleRows.map(row => {
        const codeBtn = row.querySelector('.copy-btn');
        return decodeURIComponent(codeBtn.dataset.code);
      });
      
      // Join all codes with a blank line between each
      const combinedCode = allCodes.join('\\n\\n');
      
      // Copy to clipboard
      navigator.clipboard.writeText(combinedCode).then(() => {
        showCopyNotification();
      });
    }


    function initializeDataTable() {
      if (dataTable) {
        dataTable.destroy();
      }

      populateTable();

      dataTable = new DataTable(snippetsTable, {
        perPage: parseInt(perPageSelect.value),
        perPageSelect: false,
        searchable: true,
        sortable: false,
        fixedHeight: true,
        labels: {
          placeholder: "Search...",
          perPage: "{select}",
          noRows: "No entries found",
          info: "Showing {start} to {end} of {rows} entries",
        },
      });

      positionSearchInput();
    }

    // Initialize DataTable
    initializeDataTable();


    snippetsTable.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (row && !e.target.classList.contains('copy-btn')) {
        const name = row.querySelector('span').textContent;
        const code = decodeURIComponent(row.querySelector('.copy-btn').dataset.code);
        showModal(name, code);
      }
    });

    function showModal(name, code) {
      modalTitle.textContent = name;
      codeContent.textContent = code;
      hljs.highlightElement(codeContent);
      codeModal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
      codeModal.classList.add('hidden');
    });

    codeModal.addEventListener('click', (e) => {
      if (e.target === codeModal) {
        codeModal.classList.add('hidden');
      }
    });

    function showCopyNotification() {
      copyNotification.classList.remove('opacity-0');
      setTimeout(() => {
        copyNotification.classList.add('opacity-0');
      }, 2000);
    }

    copyCode.addEventListener('click', () => {
      navigator.clipboard.writeText(codeContent.textContent).then(() => {
        showCopyNotification();
      });
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-btn')) {
        e.stopPropagation();
        const code = decodeURIComponent(e.target.dataset.code);
        navigator.clipboard.writeText(code).then(() => {
          showCopyNotification();
        });
      }
    });

    sortByNameBtn.addEventListener('click', () => {
      isAscending = !isAscending;
      tableData.sort((a, b) => {
        return isAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
      initializeDataTable();
    });

    perPageSelect.addEventListener('change', (e) => {
      initializeDataTable();
    });
  </script>
</body>
</html>`;
    return html;
  } catch (error) {
    console.error(`[generateHTML] ${error}`);
    process.exit(1);
  }
};

/* ----------------------------------------------------------------
 * escape HTML
-----------------------------------------------------------------*/
function escapeHtml(string) {
  if (typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function (match) {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match];
  });
}
