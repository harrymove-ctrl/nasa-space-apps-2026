FROM oven/bun:1-alpine AS cradleflow-build
WORKDIR /build/project_2

COPY projects/project_2/package.json projects/project_2/bun.lock ./
RUN bun install --frozen-lockfile

COPY projects/project_2/ .
RUN VITE_BASE_PATH=/cradleflow/ bun run build

FROM oven/bun:1-alpine AS dopaimint-app
WORKDIR /app

COPY projects/project_1/package.json projects/project_1/bun.lock ./
RUN bun install --frozen-lockfile

COPY projects/project_1/ .
ENV VITE_CRADLEFLOW_URL=/cradleflow/index.html
RUN bunx tsc -b && bunx vite build

COPY --from=cradleflow-build /build/project_2/dist /app/dist/cradleflow

ENV PORT=8080
EXPOSE 8080
CMD ["bun", "server.mjs"]
