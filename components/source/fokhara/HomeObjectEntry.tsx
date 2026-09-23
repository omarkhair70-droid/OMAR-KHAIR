"use client";

import { CarryProductLink } from "@/components/CarryProductLink";
import type { Product } from "@/lib/products";
import { formatEgp } from "@/lib/products";
import { TrackedLink } from "@/components/TrackedLink";
import { materialStateCssVars } from "@/lib/visual/material-state";

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
          <TrackedLink
            className="buttonPrimary"
            href="/shop"
            eventName="home_shop_enter"
          >
            Explore ceramics
          </TrackedLink>
          <TrackedLink
            className="buttonGhost"
            href="/workshops"
            eventName="home_workshops_enter"
          >
            Enter the process
          </TrackedLink>
        </div>
      </div>

      <CarryProductLink
        product={product}
        className="homeObject__product"
        style={materialStateCssVars(product.collection)}
        visualRole="home"
      >
        <div className="objectCaption">
          <span>{product.collection}</span>
          <strong>{product.name}</strong>
          <span>{formatEgp(product.priceEgp)}</span>
        </div>
      </CarryProductLink>
    </section>
  );
}
