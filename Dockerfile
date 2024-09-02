FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /front-end

COPY /front-end/package*.json ./
COPY /front-end/prisma ./prisma
RUN ls
RUN npm install --legacy-peer-deps

FROM base AS builder
WORKDIR /front-end
COPY --from=deps /front-end/node_modules ./node_modules
COPY /front-end .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM base AS runner
WORKDIR /front-end

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /front-end/public ./public
COPY --from=builder --chown=nextjs:nodejs /front-end/.next ./.next
COPY --from=builder /front-end/node_modules ./node_modules
COPY --from=builder /front-end/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]