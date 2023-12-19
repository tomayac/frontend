import type { HassEntity } from "home-assistant-js-websocket";
import {
  CSSResultGroup,
  LitElement,
  TemplateResult,
  css,
  html,
  nothing,
} from "lit";
import { customElement, property } from "lit/decorators";
import { HomeAssistant } from "../../../types";
import type { HuiErrorCard } from "../cards/hui-error-card";
import { LovelaceCardFeatureLayout } from "../cards/types";
import { createCardFeatureElement } from "../create-element/create-card-feature-element";
import type { LovelaceCardFeature } from "../types";
import type { LovelaceCardFeatureConfig } from "./types";

@customElement("hui-card-features")
export class HuiCardFeatures extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ attribute: false }) public features?: LovelaceCardFeatureConfig[];

  @property({ attribute: false }) public layout?: LovelaceCardFeatureLayout;

  @property({ attribute: false }) public color?: string;

  private _featuresElements = new WeakMap<
    LovelaceCardFeatureConfig,
    LovelaceCardFeature | HuiErrorCard
  >();

  private _getFeatureElement(feature: LovelaceCardFeatureConfig) {
    if (!this._featuresElements.has(feature)) {
      const element = createCardFeatureElement(feature);
      this._featuresElements.set(feature, element);
      return element;
    }

    return this._featuresElements.get(feature)!;
  }

  private renderFeature(
    featureConf: LovelaceCardFeatureConfig,
    stateObj: HassEntity
  ): TemplateResult {
    const element = this._getFeatureElement(featureConf);

    if (this.hass) {
      element.hass = this.hass;
      (element as LovelaceCardFeature).stateObj = stateObj;
      (element as LovelaceCardFeature).color = this.color;
    }

    return html`${element}`;
  }

  protected render() {
    if (!this.features) {
      return nothing;
    }

    const containerClass = this.layout?.type ? ` ${this.layout.type}` : "";

    return html`
      <div class="container${containerClass}">
        ${this.features.map((featureConf) =>
          this.renderFeature(featureConf, this.stateObj)
        )}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --feature-color: var(--state-icon-color);
        --feature-padding: 12px;
      }
      .container {
        display: flex;
        flex-direction: column;
        padding: var(--feature-padding);
        padding-top: 0px;
        gap: var(--feature-padding);
      }
      .container.horizontal {
        display: flex;
        flex-direction: row;
      }
      .container.horizontal > * {
        flex: 1;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-card-features": HuiCardFeatures;
  }
}
