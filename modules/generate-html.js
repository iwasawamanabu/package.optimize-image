/* eslint-disable no-undef */
/* ----------------------------------------------------------------
 * generate html
-----------------------------------------------------------------*/
export const generateHTML = async (config, tags) => {
  try {
    // テンプレートリテラルの内部でのエスケープに注意
    const publicPathJs = config.snippetsOption.public || '/public';

    const tagsJson = tags.map((tag) => {
      return {
        image: tag.code.replaceAll(config.snippetsOption.path, config.snippetsOption.public + config.snippetsOption.path),
        name: tag.name,
        code: tag.code,
      };
    });

    // JSONとして安全にシリアライズ
    const tagsJsonString = JSON.stringify(tagsJson);

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
    #imagePreviewContainer {
      width: 100%;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f8f8;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      overflow: hidden;
      position: relative;
    }
    #imagePreviewContainer img {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      cursor: pointer;
    }
    #formatIndicator {
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .image-preview-responsive {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .preview-tabs {
      display: flex;
      margin-bottom: 8px;
    }
    .preview-tab {
      padding: 8px 16px;
      background-color: #e2e8f0;
      cursor: pointer;
      border-radius: 4px 4px 0 0;
    }
    .preview-tab.active {
      background-color: #3b82f6;
      color: white;
    }
    @media (max-width: 768px) {
      .modal-content {
        flex-direction: column;
      }
      #imagePreviewContainer,
      .code-container {
        width: 100%;
      }
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
    <div class="bg-white rounded-lg p-6 max-w-5xl w-full mx-4">
      <div class="flex justify-end items-center mb-4">
        <button id="closeModal" class="text-gray-500 hover:text-gray-700">&times;</button>
      </div>
      <div class="modal-content flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-1/2">
          <div id="previewContainer" class="w-full">
            <!-- Preview tabs for responsive images will be added here if needed -->
            <div id="imagePreviewContainer">
              <!-- Image preview will be inserted here -->
              <span id="formatIndicator" class="hidden"></span>
            </div>
          </div>
          <div id="formatToggleMessage" class="mt-2 text-sm text-gray-600 hidden"></div>
        </div>
        <div class="code-container w-full md:w-1/2">
          <pre class="h-80 overflow-y-auto"><code id="codeContent" class="language-html"></code></pre>
          <div class="mt-4 flex justify-end">
            <button id="copyCode" class="px-4 py-2 bg-blue-500 text-white rounded">コピー</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="copyNotification" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 opacity-0">
    コードをクリップボードにコピーしました！
  </div>

  <script>
    // データをJSONとして安全に取り込む
    const tableData = ${tagsJsonString};
    const publicPath = "${publicPathJs}";
    
    const snippetsTable = document.getElementById('snippetsTable');
    const codeModal = document.getElementById('codeModal');
    const modalTitle = document.getElementById('modalTitle');
    const codeContent = document.getElementById('codeContent');
    const closeModal = document.getElementById('closeModal');
    const copyCode = document.getElementById('copyCode');
    const sortByNameBtn = document.getElementById('sortByName');
    const copyNotification = document.getElementById('copyNotification');
    const perPageSelect = document.getElementById('perPage');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const previewContainer = document.getElementById('previewContainer');
    const formatIndicator = document.getElementById('formatIndicator');
    let isAscending = true;
    let dataTable;

    function populateTable() {
      let tableHtml = '<tbody>';
      
      tableData.forEach(item => {
        tableHtml += \`
          <tr class="bg-gray-100 hover:bg-gray-200 cursor-pointer">
            <td class="p-3 flex items-center justify-between">
              <div class="flex items-center">
                <span class="w-16 h-16 object-cover rounded mr-4">\${item.image}</span>
                <span>\${item.name}</span>
              </div>
              <button class="copy-btn px-3 py-1 bg-blue-500 text-white rounded" data-code="\${encodeURIComponent(item.code)}">
                コピー
              </button>
            </td>
          </tr>
        \`;
      });
      
      tableHtml += '</tbody>';
      snippetsTable.innerHTML = tableHtml;
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
        allCopyBtn.textContent = '全てコピー';
        
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
        alert('コピーするスニペットがありません');
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
          placeholder: "検索...",
          perPage: "{select}",
          noRows: "データがありません",
          info: "{rows}件中 {start}〜{end}件を表示",
        },
      });

      positionSearchInput();
    }

    // Parse HTML code to extract image sources and formats
    function parseImageSources(htmlCode) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlCode, 'text/html');
      const picture = doc.querySelector('picture');
      
      if (!picture) {
        // If there's no picture element, try to find a regular img
        const img = doc.querySelector('img');
        if (img) {
          return {
            isResponsive: false,
            formats: [{
              type: 'original',
              src: img.getAttribute('src'),
              width: img.getAttribute('width'),
              height: img.getAttribute('height')
            }]
          };
        }
        return null;
      }
      
      // Check if this is a responsive image (has media queries)
      const responsiveSources = Array.from(picture.querySelectorAll('source[media]'));
      const isResponsive = responsiveSources.length > 0;
      
      if (isResponsive) {
        // Handle responsive image
        const desktopFormats = [];
        const mobileFormats = [];
        
        // Get desktop formats (sources without media or with desktop media)
        Array.from(picture.querySelectorAll('source:not([media]), source[media*="min-width"]'))
          .forEach(source => {
            const format = {
              type: source.getAttribute('type')?.split('/')[1] || 'original',
              src: source.getAttribute('srcset'),
              width: source.getAttribute('width'),
              height: source.getAttribute('height')
            };
            desktopFormats.push(format);
          });
        
        // Get mobile formats (sources with max-width media)
        Array.from(picture.querySelectorAll('source[media*="max-width"]'))
          .forEach(source => {
            const format = {
              type: source.getAttribute('type')?.split('/')[1] || 'original',
              src: source.getAttribute('srcset'),
              width: source.getAttribute('width'),
              height: source.getAttribute('height')
            };
            mobileFormats.push(format);
          });
        
        // Add the img tag as original format for both desktop and mobile if not already included
        const img = picture.querySelector('img');
        if (img) {
          const originalFormat = {
            type: 'original',
            src: img.getAttribute('src'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height')
          };
          
          // Add to desktop if not already included
          if (!desktopFormats.some(f => f.type === 'original')) {
            desktopFormats.push(originalFormat);
          }
          
          // Add to mobile if not already included
          if (!mobileFormats.some(f => f.type === 'original')) {
            mobileFormats.push(originalFormat);
          }
        }
        
        return {
          isResponsive: true,
          desktop: orderFormats(desktopFormats),
          mobile: orderFormats(mobileFormats)
        };
      } else {
        // Handle non-responsive image
        const formats = [];
        
        // Get all sources
        Array.from(picture.querySelectorAll('source')).forEach(source => {
          const format = {
            type: source.getAttribute('type')?.split('/')[1] || 'original',
            src: source.getAttribute('srcset'),
            width: source.getAttribute('width'),
            height: source.getAttribute('height')
          };
          formats.push(format);
        });
        
        // Add the img tag as original format if not already included
        const img = picture.querySelector('img');
        if (img) {
          formats.push({
            type: 'original',
            src: img.getAttribute('src'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height')
          });
        }
        
        return {
          isResponsive: false,
          formats: orderFormats(formats)
        };
      }
    }
    
    // Order formats to ensure AVIF > WebP > Original
    function orderFormats(formats) {
      // Define preferred order
      const order = { 'avif': 0, 'webp': 1, 'original': 2 };
      
      // Sort formats based on preferred order
      return formats.sort((a, b) => {
        const orderA = order[a.type] !== undefined ? order[a.type] : 3;
        const orderB = order[b.type] !== undefined ? order[b.type] : 3;
        return orderA - orderB;
      });
    }
    
    // Replace path for preview
    function replacePathForPreview(path) {
      if (!path || typeof path !== 'string') return '';
      return path.startsWith('/') ? publicPath + path : path;
    }
    
    // Create the image preview element
    function createImagePreview(container, imageSources) {
      container.innerHTML = '';
      
      if (!imageSources) {
        container.innerHTML = '<div class="text-gray-500">プレビューは利用できません</div>';
        return;
      }
      
      if (imageSources.isResponsive) {
        // Create tabs for responsive preview
        const previewElement = document.createElement('div');
        previewElement.className = 'image-preview-responsive';
        
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'preview-tabs';
        
        const desktopTab = document.createElement('div');
        desktopTab.className = 'preview-tab active';
        desktopTab.textContent = 'デスクトップ';
        desktopTab.dataset.view = 'desktop';
        
        const mobileTab = document.createElement('div');
        mobileTab.className = 'preview-tab';
        mobileTab.textContent = 'モバイル';
        mobileTab.dataset.view = 'mobile';
        
        tabsContainer.appendChild(desktopTab);
        tabsContainer.appendChild(mobileTab);
        previewElement.appendChild(tabsContainer);
        
        const previewContainer = document.createElement('div');
        previewContainer.id = 'imagePreviewContainer';
        
        // Start with desktop view
        addImageWithFormatToggle(previewContainer, imageSources.desktop);
        
        // Add format indicator
        const indicator = document.createElement('span');
        indicator.id = 'formatIndicator';
        indicator.className = imageSources.desktop.length > 1 ? '' : 'hidden';
        indicator.textContent = imageSources.desktop[0]?.type.toUpperCase() || 'オリジナル';
        previewContainer.appendChild(indicator);
        
        previewElement.appendChild(previewContainer);
        container.appendChild(previewElement);
        
        // Update format toggle message based on available formats
        updateFormatToggleMessage(imageSources.desktop);
        
        // Add tab switching functionality
        tabsContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('preview-tab')) {
            // Update active tab
            Array.from(tabsContainer.querySelectorAll('.preview-tab')).forEach(tab => {
              tab.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Update preview based on selected tab
            const view = e.target.dataset.view;
            previewContainer.innerHTML = '';
            
            if (view === 'desktop') {
              addImageWithFormatToggle(previewContainer, imageSources.desktop);
              updateFormatToggleMessage(imageSources.desktop);
            } else {
              addImageWithFormatToggle(previewContainer, imageSources.mobile);
              updateFormatToggleMessage(imageSources.mobile);
            }
            
            // Add format indicator
            const formats = view === 'desktop' ? imageSources.desktop : imageSources.mobile;
            const indicator = document.createElement('span');
            indicator.id = 'formatIndicator';
            indicator.className = formats.length > 1 ? '' : 'hidden';
            indicator.textContent = formats[0]?.type.toUpperCase() || 'オリジナル';
            previewContainer.appendChild(indicator);
          }
        });
      } else {
        // Non-responsive image
        addImageWithFormatToggle(container, imageSources.formats);
        
        // Add format indicator
        const indicator = document.createElement('span');
        indicator.id = 'formatIndicator';
        indicator.className = imageSources.formats.length > 1 ? '' : 'hidden';
        indicator.textContent = imageSources.formats[0]?.type.toUpperCase() || 'オリジナル';
        container.appendChild(indicator);
        
        // Update format toggle message based on available formats
        updateFormatToggleMessage(imageSources.formats);
      }
    }
    
    // Update the format toggle message based on available formats
    function updateFormatToggleMessage(formats) {
      const messageElement = document.getElementById('formatToggleMessage');
      
      // If there's only one format or no formats, hide the message
      if (!formats || formats.length <= 1) {
        messageElement.classList.add('hidden');
        return;
      }
      
      // Get available format types
      const formatTypes = formats.map(format => format.type);
      let message = '画像をクリックすると形式が切り替わります (';
      let parts = [];
      
      if (formatTypes.includes('avif')) {
        parts.push('AVIF');
      }
      
      if (formatTypes.includes('webp')) {
        parts.push('WebP');
      }
      
      if (formatTypes.includes('original')) {
        parts.push('オリジナル');
      }
      
      message += parts.join(' → ') + ')';
      messageElement.textContent = message;
      messageElement.classList.remove('hidden');
    }
    
    // Add image with format toggle functionality
    function addImageWithFormatToggle(container, formats) {
      if (!formats || formats.length === 0) {
        container.innerHTML = '<div class="text-gray-500">プレビューは利用できません</div>';
        return;
      }
      
      let currentFormatIndex = 0;
      const img = document.createElement('img');
      img.alt = 'プレビュー';
      
      // Set initial image
      const initialFormat = formats[currentFormatIndex];
      img.src = replacePathForPreview(initialFormat.src);
      
      if (initialFormat.width && initialFormat.height) {
        img.setAttribute('width', initialFormat.width);
        img.setAttribute('height', initialFormat.height);
      }
      
      // Add click event to toggle formats
      if (formats.length > 1) {
        img.addEventListener('click', () => {
          currentFormatIndex = (currentFormatIndex + 1) % formats.length;
          const nextFormat = formats[currentFormatIndex];
          img.src = replacePathForPreview(nextFormat.src);
          
          // Update format indicator
          const indicator = container.querySelector('#formatIndicator');
          if (indicator) {
            indicator.textContent = nextFormat.type.toUpperCase();
          }
        });
      }
      
      container.appendChild(img);
    }

    // Show modal with code and image preview
    function showModal(name, code) {
      codeContent.textContent = code;
      hljs.highlightElement(codeContent);
      
      // Parse image sources from the code
      const imageSources = parseImageSources(code);
      
      // Create image preview
      createImagePreview(previewContainer, imageSources);
      
      codeModal.classList.remove('hidden');
    }

    // Initialize DataTable
    initializeDataTable();

    snippetsTable.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (row && !e.target.classList.contains('copy-btn')) {
        const name = row.querySelector('span:not(.w-16)').textContent;
        const code = decodeURIComponent(row.querySelector('.copy-btn').dataset.code);
        showModal(name, code);
      }
    });

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
