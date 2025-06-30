CREATE SCHEMA IF NOT EXISTS artwork_context;

CREATE TABLE artwork_context.artworks (
                                         id SERIAL PRIMARY KEY,

                                         name VARCHAR(255) NOT NULL,

                                         description TEXT,

                                         artwork_type_id INT NOT NULL,

                                         material_ids JSONB NOT NULL,

                                         dimension_l DECIMAL(18, 2) NOT NULL,
                                         dimension_w DECIMAL(18, 2) NOT NULL,
                                         dimension_h DECIMAL(18, 2) NOT NULL,

                                         dimension_unit VARCHAR(50) NOT NULL,
                                         weight_category VARCHAR(50) NOT NULL,

                                         price DECIMAL(18, 2) NOT NULL,
                                         creation_year INT NOT NULL,
                                         status VARCHAR(50) NOT NULL,

                                         is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

                                         created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                                         updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX ix_artworks_name ON artwork_context.artworks (name);

CREATE INDEX ix_artworks_status ON artwork_context.artworks (status);

CREATE INDEX ix_artworks_is_deleted ON artwork_context.artworks (is_deleted);