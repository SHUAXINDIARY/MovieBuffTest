// import { LitElement, html, css } from 'lit';
import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { getData } from "./getData.js";

export class MovieList extends LitElement {
  static properties = {
    data: { type: Object },
    selectedMovies: { type: Array },
    collapsedYears: { type: Array },
    type: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .year-section {
      margin-bottom: 40px;
    }

    .year-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #eee;
    }

    .year-title {
      font-size: 24px;
      color: #333;
      margin: 0;
    }

    .toggle-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .toggle-button::before {
      content: "";
      width: 12px;
      height: 12px;
      border-right: 2px solid #666;
      border-bottom: 2px solid #666;
      transform: rotate(45deg);
      transition: transform 0.3s ease;
    }

    .toggle-button.collapsed::before {
      transform: rotate(-45deg);
    }

    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      overflow: hidden;
      max-height: 2050px;
      opacity: 1;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 16px;
      margin-bottom: 16px;
    }

    .movie-grid.collapsed {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
      margin-bottom: 0;
    }

    .movie-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
      min-height: 60px;
      display: flex;
      align-items: center;
    }

    .movie-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 8px;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    }

    .movie-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .movie-card.selected {
      background-color: #e3f2fd;
    }

    .movie-card.selected::before {
      border-color: #2196f3;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
    }

    .movie-title {
      font-size: 16px;
      color: #333;
      margin: 0;
      line-height: 1.4;
    }
  `;

  constructor() {
    super();
    this.data = {};
    this.selectedMovies = JSON.parse(localStorage.getItem("movie") || "[]");
    this.collapsedYears = [];
    this.type = '';
  }

  async firstUpdated() {
    try {
      this.type = this.getAttribute("type");
      this.data = await getData[this.type]();
      this.requestUpdate();
    } catch (error) {
      console.error("Error loading movie data:", error);
    }
  }

  handleMovieClick(movieTitle) {
    const index = this.selectedMovies.indexOf(movieTitle);
    if (index === -1) {
      this.selectedMovies = [...this.selectedMovies, movieTitle];
    } else {
      this.selectedMovies = this.selectedMovies.filter(movie => movie !== movieTitle);
    }

    localStorage.setItem("movie", JSON.stringify(this.selectedMovies));

    this.dispatchEvent(
      new CustomEvent("selection-change", {
        detail: {
          selectedMovies: this.selectedMovies,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  handleYearToggle(year) {
    const index = this.collapsedYears.indexOf(year);
    if (index === -1) {
      this.collapsedYears = [...this.collapsedYears, year];
    } else {
      this.collapsedYears = this.collapsedYears.filter(y => y !== year);
    }
  }

  isYearCollapsed(year) {
    return this.collapsedYears.includes(year);
  }

  isMovieSelected(movie) {
    return this.selectedMovies.includes(movie);
  }

  render() {
    const years = Object.keys(this.data).sort((a, b) => b - a);

    return html`
      ${years.map(
        (year) => html`
          <div class="year-section">
            <div class="year-header">
              <h2 class="year-title">${year}</h2>
              <button
                class="toggle-button ${this.isYearCollapsed(year) ? "collapsed" : ""}"
                @click=${() => this.handleYearToggle(year)}
              ></button>
            </div>
            <div
              class="movie-grid ${this.isYearCollapsed(year) ? "collapsed" : ""}"
            >
              ${this.data[year].map(
                (movie) => html`
                  <div
                    class="movie-card ${this.isMovieSelected(movie) ? "selected" : ""}"
                    @click=${() => this.handleMovieClick(movie)}
                  >
                    <h3 class="movie-title">${movie}</h3>
                  </div>
                `
              )}
            </div>
          </div>
        `
      )}
    `;
  }
}

customElements.define("movie-list", MovieList);
