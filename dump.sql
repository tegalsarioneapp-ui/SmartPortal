--
-- PostgreSQL database dump
--

\restrict why4uLXYhpiJ3O1qIDcS7PIfjofbGEgwhkLgDoWGdZMBYP8wuIS70bm8gj6tLgF

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: kv_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kv_store (
    key text NOT NULL,
    value text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.kv_store OWNER TO postgres;

--
-- Data for Name: kv_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kv_store (key, value, updated_at) FROM stdin;
\.


--
-- Name: kv_store kv_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kv_store
    ADD CONSTRAINT kv_store_pkey PRIMARY KEY (key);


--
-- PostgreSQL database dump complete
--

\unrestrict why4uLXYhpiJ3O1qIDcS7PIfjofbGEgwhkLgDoWGdZMBYP8wuIS70bm8gj6tLgF

