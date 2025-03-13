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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vanilla-datatables@latest/dist/vanilla-dataTables.min.css">
  <script src="https://cdn.jsdelivr.net/npm/vanilla-datatables@latest/dist/vanilla-dataTables.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f9fafb;
      color: #1f2937;
    }
    
    /* DataTable Override Styles */
    .dataTable-input, .dataTable-selector {
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      background-color: white;
      color: #374151;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .dataTable-input:focus, .dataTable-selector:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    .dataTable-pagination a {
      padding: 0.5rem 0.75rem;
      margin: 0 0.25rem;
      border-radius: 0.375rem;
      background-color: white;
      color: #4b5563;
      border: 1px solid #e5e7eb;
      transition: all 0.2s;
    }
    
    .dataTable-pagination a:hover {
      background-color: #f3f4f6;
    }
    
    .dataTable-pagination a.active {
      background-color: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    
    .dataTable-container {
      height: calc(100% - 40px) !important;
      overflow-y: auto;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
      background-color: white;
      padding: 1rem;
    }
    
    .dataTable-container thead {
      display: none;
    }
    
    .dataTable-top {
      padding: 0;
      margin-bottom: 1rem;
    }
    
    .dataTable-bottom {
      margin-top: auto;
      position: absolute;
      bottom: 1rem;
      left: 0;
      right: 0;
      margin-inline: auto;
      padding: 0 1rem;
    }
    
    /* App Specific Styles */
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .app-header {
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .app-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    
    .viewer-card {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      height: 75vh;
      position: relative;
    }
    
    .viewer-header {
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .viewer-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }
    
    .viewer-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s;
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: #3b82f6;
      color: white;
      border: 1px solid #3b82f6;
    }
    
    .btn-primary:hover {
      background-color: #2563eb;
      border-color: #2563eb;
    }
    
    .btn-secondary {
      background-color: white;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }
    
    .btn-secondary:hover {
      background-color: #f9fafb;
    }
    
    .snippet-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.2s;
      cursor: pointer;
      width: 100%;
      padding: 0;
    }

    .snippet-row td{
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .snippet-row:hover {
      background-color: #f9fafb;
    }
    
    .snippet-details {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .snippet-thumbnail {
      width: 64px;
      height: 64px;
      border-radius: 0.375rem;
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
    }
    
    .snippet-thumbnail img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .snippet-name {
      font-weight: 500;
      color: #374151;
    }
    
    .search-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 50;
    }
    
    /* Image Preview Styles */
    #previewContainer{
    position: relative;
    }
    #imagePreviewContainer {
      width: 100%;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
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
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
    }
    
    .image-preview-responsive {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .preview-tabs {
      display: flex;
    }
    
    .preview-tab {
      padding: 0.5rem 1rem;
      background-color: #f3f4f6;
      cursor: pointer;
      border-radius: 0.375rem 0.375rem 0 0;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    
    .preview-tab.active {
      background-color: #3b82f6;
      color: white;
    }
    
    .preview-tab:hover:not(.active) {
      background-color: #e5e7eb;
    }
    
    /* Modal Styles */
    .shadcn-modal {
      max-width: 72rem;
      width: 95%;
      border-radius: 0.75rem;
      background-color: white;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .shadcn-modal-header {
      display: flex;
      justify-content: flex-end;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .shadcn-modal-content {
      padding: 1.5rem;
    }
    
    .shadcn-code-container {
      position: relative;
      border-radius: 0.5rem;
      background-color: #1e293b;
      overflow: hidden;
    }
    
    .shadcn-code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: #0f172a;
      color: #94a3b8;
      font-size: 0.875rem;
      border-bottom: 1px solid #334155;
    }
    
    .shadcn-code-content {
      padding: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .shadcn-code-footer {
      padding: 0.75rem 1rem;
      background-color: #1e293b;
      border-top: 1px solid #334155;
    }
    
    .shadcn-checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background-color: #0f172a;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
    }
    
    .shadcn-checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      font-size: 0.875rem;
      color: #cbd5e1;
    }
    
    .shadcn-checkbox {
      appearance: none;
      width: 1rem;
      height: 1rem;
      border: 1px solid #64748b;
      border-radius: 0.25rem;
      margin-right: 0.5rem;
      position: relative;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .shadcn-checkbox:checked {
      background-color: #3b82f6;
      border-color: #3b82f6;
    }
    
    .shadcn-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .shadcn-button {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 0.2s;
      font-size: 0.875rem;
      cursor: pointer;
    }
    
    .shadcn-button-primary {
      background-color: #3b82f6;
      color: white;
      border: 1px solid #3b82f6;
    }
    
    .shadcn-button-primary:hover {
      background-color: #2563eb;
      border-color: #2563eb;
    }
    
    .shadcn-button-ghost {
      background-color: transparent;
      color: #94a3b8;
      border: 1px solid transparent;
    }
    
    .shadcn-button-ghost:hover {
      background-color: #1e293b;
    }
    
    /* Notification */
    .notification {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background-color: #10b981;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      opacity: 0;
      transform: translateY(1rem);
      transition: all 0.3s ease;
      z-index: 9999;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    @media (max-width: 768px) {
      .shadcn-grid {
        flex-direction: column;
      }
      
      .shadcn-col {
        width: 100%;
      }
      
      .viewer-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
      
      .viewer-controls {
        width: 100%;
        justify-content: space-between;
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="app-header">
      <h1 class="app-title">OptimizeImage Snippets</h1>
    </div>
    
    <div class="viewer-card">
      <div class="viewer-header">
        <h2 class="viewer-title">スニペットライブラリ</h2>
        <div class="viewer-controls">
          <div class="flex items-center gap-3">
            <span id="pagination-info" class="text-sm text-gray-500"></span>
            <select id="perPage" class="dataTable-selector">
              <option value="5">5 per page</option>
              <option value="10" selected>10 per page</option>
              <option value="15">15 per page</option>
              <option value="20">20 per page</option>
            </select>
          </div>
          <button id="sortByName" class="btn btn-secondary">名前で並べ替え</button>
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

  <!-- Modal -->
  <div id="codeModal" class="fixed inset-0 bg-black bg-opacity-70 hidden flex items-center justify-center" style="z-index: 9999;">
    <div class="shadcn-modal">
      <div class="shadcn-modal-header">
        <button id="closeModal" class="shadcn-button shadcn-button-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="shadcn-modal-content">
        <div class="flex flex-col md:flex-row gap-6 shadcn-grid">
          <div class="w-full md:w-1/2 shadcn-col">
            <div id="previewContainer" class="w-full">
              <!-- Preview tabs for responsive images will be added here if needed -->
              <div id="imagePreviewContainer">
                <!-- Image preview will be inserted here -->
                <span id="formatIndicator" class="hidden"></span>
              </div>
            </div>
            <div id="formatToggleMessage" class="mt-2 text-sm text-gray-500 hidden"></div>
          </div>
          <div class="w-full md:w-1/2 shadcn-col">
            <div class="shadcn-code-container">
              <div class="shadcn-code-header">
                <span>HTML</span>
              </div>
              <div class="shadcn-code-content">
                <pre><code id="codeContent" class="language-html"></code></pre>
              </div>
              <div class="shadcn-code-footer">
                <div class="shadcn-checkbox-group">
                  <div id="formatOptions" class="flex gap-3">
                    <label id="avifOptionLabel" class="shadcn-checkbox-label hidden">
                      <input type="checkbox" id="avifOption" checked class="shadcn-checkbox">
                      <span>AVIF</span>
                    </label>
                    <label id="webpOptionLabel" class="shadcn-checkbox-label hidden">
                      <input type="checkbox" id="webpOption" checked class="shadcn-checkbox">
                      <span>WebP</span>
                    </label>
                  </div>
                  <div class="flex gap-3">
                    <label class="shadcn-checkbox-label">
                      <input type="checkbox" id="decodingOption" checked class="shadcn-checkbox">
                      <span>decoding</span>
                    </label>
                    <label class="shadcn-checkbox-label">
                      <input type="checkbox" id="loadingOption" class="shadcn-checkbox">
                      <span>loading</span>
                    </label>
                  </div>
                </div>
                <div class="flex justify-end mt-3">
                  <button id="copyCode" class="shadcn-button shadcn-button-primary">コピー</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="copyNotification" class="notification">
    コードをクリップボードにコピーしました！
  </div>

  <script>
    // データをJSONとして安全に取り込む
    const tableData = ${tagsJsonString};
    const publicPath = "${publicPathJs}";
    
    const snippetsTable = document.getElementById('snippetsTable');
    const codeModal = document.getElementById('codeModal');
    const codeContent = document.getElementById('codeContent');
    const closeModal = document.getElementById('closeModal');
    const copyCode = document.getElementById('copyCode');
    const sortByNameBtn = document.getElementById('sortByName');
    const copyNotification = document.getElementById('copyNotification');
    const perPageSelect = document.getElementById('perPage');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const previewContainer = document.getElementById('previewContainer');
    const formatIndicator = document.getElementById('formatIndicator');
    // オプションのチェックボックス要素
    const avifOption = document.getElementById('avifOption');
    const webpOption = document.getElementById('webpOption');
    const decodingOption = document.getElementById('decodingOption');
    const loadingOption = document.getElementById('loadingOption');
    const avifOptionLabel = document.getElementById('avifOptionLabel');
    const webpOptionLabel = document.getElementById('webpOptionLabel');
    
    let isAscending = true;
    let dataTable;
    let currentCode = ''; // 現在のコードを保存

    function populateTable() {
      let tableHtml = '<tbody>';
      
      tableData.forEach(item => {
        tableHtml += \`
          <tr class="snippet-row">
            <td>
              <div class="snippet-details">
                <div class="snippet-thumbnail">\${item.image}</div>
                <div class="snippet-name">\${item.name}</div>
              </div>
              <button class="copy-btn btn btn-primary" data-code="\${encodeURIComponent(item.code)}">
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
        searchContainer.classList.add('search-container');
        searchContainer.style.zIndex = '50';
        
        // Create All Copy button
        const allCopyBtn = document.createElement('button');
        allCopyBtn.id = 'allCopyBtn';
        allCopyBtn.classList.add('btn', 'btn-primary');
        allCopyBtn.textContent = '全てコピー';
        
        // Get the parent of the search input
        const parent = searchInput.parentNode;
        
        // Move the search input to our new container
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(allCopyBtn);
        
        // Add the new container to the parent
        document.body.appendChild(searchContainer);
        
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
      
      // ページネーション情報を更新
      updatePaginationInfo();
      
      // ページネーションイベントでも情報更新
      const paginationLinks = document.querySelectorAll('.dataTable-pagination a');
      if (paginationLinks) {
        paginationLinks.forEach(link => {
          link.addEventListener('click', () => {
            setTimeout(updatePaginationInfo, 100);
          });
        });
      }
    }
    
    // ページネーション情報を更新する関数
    function updatePaginationInfo() {
      const infoElement = document.querySelector('.dataTable-info');
      const paginationInfo = document.getElementById('pagination-info');
      
      if (infoElement && paginationInfo) {
        paginationInfo.textContent = infoElement.textContent;
        infoElement.style.display = 'none';
      }
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
      // オリジナルのコードを保存
      currentCode = code;
      
      // コードを表示
      updateCodeDisplay();
      
      // Parse image sources from the code
      const imageSources = parseImageSources(code);
      
      // Create image preview
      createImagePreview(previewContainer, imageSources);
      
      // チェックボックスの表示/非表示を設定
      setupOptionCheckboxes(imageSources);
      
      codeModal.classList.remove('hidden');
    }
    
    // コード表示を更新する関数
    function updateCodeDisplay() {
      let modifiedCode = currentCode;
      
      // AVIFのチェックボックスがオフの場合、AVIFのsourceタグを削除
      if (avifOption && !avifOption.checked) {
        modifiedCode = removeSourcesByType(modifiedCode, 'image/avif');
      }
      
      // WebPのチェックボックスがオフの場合、WebPのsourceタグを削除
      if (webpOption && !webpOption.checked) {
        modifiedCode = removeSourcesByType(modifiedCode, 'image/webp');
      }
      
      // sourceタグが全て削除され、pictureタグの中身がimgタグのみになった場合、pictureタグも削除
      modifiedCode = simplifyPictureIfNeeded(modifiedCode);
      
      // decodingのチェックボックスがオフの場合、decoding="async"属性を削除
      if (decodingOption && !decodingOption.checked) {
        modifiedCode = removeAttribute(modifiedCode, 'decoding="async"');
      }
      
      // loadingのチェックボックスがオンの場合、loading="lazy"属性を追加
      if (loadingOption && loadingOption.checked) {
        modifiedCode = addLoadingLazyAttribute(modifiedCode);
      }
      
      // 余分な空白行を削除
      modifiedCode = cleanupCode(modifiedCode);
      
      // 修正されたコードを表示
      codeContent.textContent = modifiedCode;
      hljs.highlightElement(codeContent);
    }
    
    // sourceタグを型別に削除する関数
    function removeSourcesByType(html, type) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const sources = doc.querySelectorAll('source[type="' + type + '"]');
      
      sources.forEach(source => {
        source.parentNode.removeChild(source);
      });
      
      // 修正されたHTML内のbody部分から内容を取得
      const pictureElements = doc.body.innerHTML;
      return pictureElements;
    }
    
    // pictureタグの中身がimgタグのみになった場合、pictureタグを削除する関数
    function simplifyPictureIfNeeded(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const pictures = doc.querySelectorAll('picture');
      
      pictures.forEach(picture => {
        const sources = picture.querySelectorAll('source');
        if (sources.length === 0) {
          const img = picture.querySelector('img');
          if (img) {
            // imgタグをpictureタグの前に挿入
            picture.parentNode.insertBefore(img, picture);
            // pictureタグを削除
            picture.parentNode.removeChild(picture);
          }
        }
      });
      
      // 修正されたHTML内のbody部分から内容を取得
      const updatedHtml = doc.body.innerHTML;
      return updatedHtml;
    }
    
    // コードを整形する関数（余分な空白行を削除）
    function cleanupCode(html) {
    console.log('claenupCode');
      try {
        // 単純なテキスト置換でインデントや空白行を処理
        let result = html;
        console.log(result);
        // 余分な空白を削除（空白行問題の解決）

        
        result = encodeURIComponent(result);
        result = result.replaceAll('%20%20%0A', '');
        result = decodeURIComponent(result);

        return result;
      } catch (error) {
        console.error('コードの整形に失敗しました:', error);
        return html; // エラーが発生した場合は元のコードを返す
      }
    }
    
    // 特定の属性を削除する関数
    function removeAttribute(html, attributeStr) {
      return html.replace(new RegExp(attributeStr, 'g'), '');
    }
    
    // loading="lazy"属性を追加する関数
    function addLoadingLazyAttribute(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const imgs = doc.querySelectorAll('img');
      
      imgs.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      });
      
      // 修正されたHTML内のbody部分から内容を取得
      const pictureElements = doc.body.innerHTML;
      return pictureElements;
    }
    
    // チェックボックスの表示/非表示を設定する関数
    function setupOptionCheckboxes(imageSources) {
      // AVIFフォーマットの存在チェック
      const hasAvif = checkFormatExists(imageSources, 'avif');
      avifOptionLabel.style.display = hasAvif ? 'flex' : 'none';
      
      // WebPフォーマットの存在チェック
      const hasWebP = checkFormatExists(imageSources, 'webp');
      webpOptionLabel.style.display = hasWebP ? 'flex' : 'none';
      
      // チェックボックスをデフォルト値に戻す
      avifOption.checked = true;
      webpOption.checked = true;
      decodingOption.checked = true;
      loadingOption.checked = false;
      
      // チェックボックスの変更イベントを設定
      avifOption.onchange = updateCodeDisplay;
      webpOption.onchange = updateCodeDisplay;
      decodingOption.onchange = updateCodeDisplay;
      loadingOption.onchange = updateCodeDisplay;
    }
    
    // 特定のフォーマットが存在するかチェックする関数
    function checkFormatExists(imageSources, formatType) {
      if (!imageSources) return false;
      
      if (imageSources.isResponsive) {
        // レスポンシブ画像の場合、デスクトップとモバイルの両方をチェック
        const desktopHasFormat = imageSources.desktop.some(format => format.type === formatType);
        const mobileHasFormat = imageSources.mobile.some(format => format.type === formatType);
        return desktopHasFormat || mobileHasFormat;
      } else {
        // 通常の画像の場合
        return imageSources.formats.some(format => format.type === formatType);
      }
    }

    // コピー成功時の通知を表示する関数
    function showCopyNotification() {
      // 通知要素を取得
      const notification = document.getElementById('copyNotification');
      
      // 要素が存在することを確認
      if (notification) {
        // クラスを追加して表示
        notification.classList.add('show');
        
        // 一定時間後に非表示
        setTimeout(() => {
          notification.classList.remove('show');
        }, 2000);
      }
    }

    // Initialize DataTable
    initializeDataTable();

    snippetsTable.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (row && !e.target.classList.contains('copy-btn')) {
        const name = row.querySelector('.snippet-name').textContent;
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

    copyCode.addEventListener('click', () => {
      const codeToUse = codeContent.textContent;
      navigator.clipboard.writeText(codeToUse).then(() => {
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
