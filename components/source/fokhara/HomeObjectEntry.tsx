"use client";

import type { Product } from "@/lib/source/fokhara/products";
import { formatEgp } from "@/lib/source/fokhara/products";
import { materialStateCssVars } from "@/lib/source/fokhara/visual/material-state";
import { ProductVisual } from "./ProductVisual";

const FULL_WORK = "https://fokhara.vercel.app";

export function HomeObjectEntry({ product }: { product: Product }) {
  return (
    <section className="homeObject">
      <div className="homeObject__copy">
        <p className="eyebrow">Form / trace / everyday use</p>
        <h1>
          The form
          <br />
          remembers.
        </h1>
        <p className="lede">
          Functional ceramics shaped by hand, glaze and firing. Each piece keeps
          a trace of how it was made, then moves into everyday use.
        </p>
        <div className="homeActions">
          <a
            className="buttonPrimary"
            href={`${FULL_WORK}/shop`}
            target="_blank"
            rel="noreferrer"
          >
            Explore ceramics
          </a>
          <a
            className="buttonGhost"
            href={`${FULL_WORK}/workshops`}
            target="_blank"
            rel="noreferrer"
          >
            Enter the process
          </a>
        </div>
      </div>

      <div
        className="homeObject__product"
        style={materialStateCssVars(product.collection)}
      >
        <div className="carrySource">
          <ProductVisual product={product} visualRole="home" />
        </div>
        <div className="objectCaption">
          <span>{product.collection}</span>
          <strong>{product.name}</strong>
          <span>{formatEgp(product.priceEgp)}</span>
        </div>
      </div>
    </section>
  );
}
