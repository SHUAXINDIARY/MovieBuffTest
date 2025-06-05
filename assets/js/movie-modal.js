import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { getData } from './getData.js';

export class MovieModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    movies: { type: Array },
    type: { type: String },
    total: { type: Number }
  };

  static styles = css`
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
      transform: translateY(-20px);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 6px rgba(52, 49, 49, 0.1);
      display: flex;
      flex-direction: column;
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
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px 12px;
      max-height: 320px;
      overflow-y: auto;
      flex: 1 1 auto;
    }

    .movie-item {
      padding: 12px;
      display: flex;
      align-items: center;
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

    @media (max-width: 600px) {
      .modal-content {
        width: 98%;
        padding: 10px;
        font-size: 15px;
      }
      .modal-title {
        font-size: 17px;
      }
      .movie-list {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px 6px;
        max-height: 220px;
      }
      .movie-item {
        padding: 8px;
        min-height: 32px;
        font-size: 14px;
      }
      .modal-footer {
        padding-top: 8px;
        margin-top: 10px;
      }
      .copy-button {
        font-size: 13px;
        padding: 6px 10px;
      }
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.movies = [];
    this.type = '';
    this.total = 0;
  }

  async firstUpdated() {
    try {
      this.type = this.getAttribute('type');
      const data = await getData[this.type]();
      this.total = Object.values(data).reduce((total, item) => total + item.length, 0);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  close() {
    this.open = false;
  }

  async captureAndDownload() {
    const modalContent = this.shadowRoot.querySelector(".modal-content");
    const movieList = this.shadowRoot.querySelector(".movie-list");
    const button = this.shadowRoot.querySelector(".copy-button");
    const originalText = button.textContent;

    // 记录原始样式
    const originalMaxHeight = modalContent.style.maxHeight;
    const originalOverflowY = modalContent.style.overflowY;
    const listOriginalMaxHeight = movieList.style.maxHeight;
    const listOriginalOverflowY = movieList.style.overflowY;
    const listOriginalHeight = movieList.style.height;

    // 临时移除高度和滚动限制
    modalContent.style.maxHeight = "none";
    modalContent.style.overflowY = "visible";
    movieList.style.maxHeight = "none";
    movieList.style.overflowY = "visible";
    movieList.style.height = "auto";

    try {
      button.textContent = "正在生成...";
      button.disabled = true;

      // 等待样式生效
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(modalContent, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // 创建下载链接
      const link = document.createElement("a");
      link.download = `清单_${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      button.textContent = "导出成功";
    } catch (error) {
      console.error("截图失败:", error);
      button.textContent = "导出失败";
    } finally {
      // 恢复原始样式
      modalContent.style.maxHeight = originalMaxHeight;
      modalContent.style.overflowY = originalOverflowY;
      movieList.style.maxHeight = listOriginalMaxHeight;
      movieList.style.overflowY = listOriginalOverflowY;
      movieList.style.height = listOriginalHeight;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  }

  render() {
    return html`
      <div class="modal-overlay" ?hidden=${!this.open}>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">已选 (${this.movies.length}/${this.total})</h2>
            <button class="close-button" @click=${this.close}>&times;</button>
          </div>
          <ul class="movie-list">
            ${this.movies.map((movie, index) => html`
              <li class="movie-item">
                <span class="movie-number">${index + 1}.</span>
                <h3 class="movie-title">${movie}</h3>
              </li>
            `)}
          </ul>
          <div class="modal-footer">
            <button class="copy-button" @click=${this.captureAndDownload}>
              导出图片
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("movie-modal", MovieModal);