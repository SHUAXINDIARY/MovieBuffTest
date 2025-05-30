class MovieModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["open"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      this.render();
    }
  }

  close() {
    this.removeAttribute("open");
  }

  async captureAndDownload() {
    const modalContent = this.shadowRoot.querySelector(".modal-content");
    const button = this.shadowRoot.querySelector(".copy-button");
    const originalText = button.textContent;

    try {
      button.textContent = "正在生成...";
      button.disabled = true;

      const canvas = await html2canvas(modalContent, {
        backgroundColor: "#ffffff",
        scale: 2, // 提高清晰度
        logging: false,
        useCORS: true,
      });

      // 创建下载链接
      const link = document.createElement("a");
      link.download = `电影清单_${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      button.textContent = "导出成功";
    } catch (error) {
      console.error("截图失败:", error);
      button.textContent = "导出失败";
    } finally {
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  }

  async render() {
    const isOpen = this.hasAttribute("open");
    const movies = this.getAttribute("movies")
      ? JSON.parse(this.getAttribute("movies"))
      : [];

    const style = `
      <style>
        :host {
          display: none;
        }

        :host([open]) {
          display: block;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        :host([open]) .modal-overlay {
          opacity: 1;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          transform: translateY(-20px);
          transition: transform 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        :host([open]) .modal-content {
          transform: translateY(0);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #666;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background-color: #f5f5f5;
        }

        .movie-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .movie-item {
          padding: 12px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
        }

        .movie-item:last-child {
          border-bottom: none;
        }

        .movie-number {
          color: #666;
          margin-right: 12px;
          min-width: 24px;
        }

        .movie-title {
          color: #333;
          margin: 0;
        }

        .modal-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          text-align: right;
        }

        .copy-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .copy-button:hover {
          background-color: #1976d2;
        }

        .copy-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      </style>
    `;
    const response = await fetch("assets/data/index.json");
    const data = await response.json();
    const total = Object.values(data).reduce((total, item) => {
      total += item.length;
      return total;
    }, 0);
    const content = `
      <div class="modal-overlay" ${!isOpen ? 'style="display: none;"' : ""}>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">已选电影 (${movies.length}/${total})</h2>
            <button class="close-button" onclick="this.getRootNode().host.close()">&times;</button>
          </div>
          <ul class="movie-list">
            ${movies
              .map(
                (movie, index) => `
              <li class="movie-item">
                <span class="movie-number">${index + 1}.</span>
                <h3 class="movie-title">${movie}</h3>
              </li>
            `
              )
              .join("")}
          </ul>
          <div class="modal-footer">
            <button class="copy-button" onclick="this.getRootNode().host.captureAndDownload()">
              导出图片
            </button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = `${style}${content}`;
  }
}

customElements.define("movie-modal", MovieModal);
