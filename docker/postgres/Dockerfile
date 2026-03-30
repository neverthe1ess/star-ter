FROM pgvector/pgvector:0.8.0-pg17

# PostGIS 설치 (geometry 타입, st_setsrid, st_makepoint 등 사용)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       postgresql-17-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

# 최초 부팅 시 확장 활성화
COPY init-extensions.sql /docker-entrypoint-initdb.d/
