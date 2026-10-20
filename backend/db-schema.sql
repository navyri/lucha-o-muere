--
-- PostgreSQL database dump
--


-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: battle_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.battle_status AS ENUM (
    'Pending',
    'Approved',
    'Closed',
    'Start'
);


--
-- Name: contestant_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contestant_status AS ENUM (
    'Alive',
    'Dead',
    'Escaped',
    'Free'
);


--
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_status AS ENUM (
    'Completed',
    'Failed',
    'Discovered'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'Admin',
    'Dictator',
    'Sponsor'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(100) NOT NULL,
    role public.user_role NOT NULL
);


--
-- Name: battle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.battle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    contestant_1 uuid NOT NULL,
    contestant_2 uuid NOT NULL,
    winner_id uuid,
    death_occurred boolean DEFAULT false,
    casualty_id uuid,
    injuries text,
    dictator_id uuid NOT NULL,
    status public.battle_status DEFAULT 'Pending'::public.battle_status,
    CONSTRAINT battle_check CHECK ((contestant_1 <> contestant_2))
);


--
-- Name: bet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bet (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    battle_id uuid,
    amount numeric(10,2),
    predicted_winner uuid,
    bet_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bettor_id uuid NOT NULL,
    bettor_type character varying(10),
    CONSTRAINT bet_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT bet_bettor_type_check CHECK (((bettor_type)::text = ANY (ARRAY[('Dictator'::character varying)::text, ('Sponsor'::character varying)::text])))
);


--
-- Name: blackmarkettransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blackmarkettransaction (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item character varying(100) NOT NULL,
    amount numeric(10,2),
    status public.transaction_status DEFAULT 'Discovered'::public.transaction_status,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    buyer_id uuid,
    seller_id uuid NOT NULL,
    CONSTRAINT blackmarkettransaction_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: buff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    effect text NOT NULL,
    duration integer,
    contestant_id uuid NOT NULL,
    source_type character varying(10) NOT NULL,
    source_id uuid NOT NULL,
    CONSTRAINT buff_duration_check CHECK ((duration > 0)),
    CONSTRAINT buff_source_type_check CHECK (((source_type)::text = ANY (ARRAY[('sponsor'::character varying)::text, ('dictator'::character varying)::text])))
);


--
-- Name: contestant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contestant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    nickname character varying(50),
    strength integer NOT NULL,
    agility integer NOT NULL,
    health integer DEFAULT 100,
    wins integer DEFAULT 0,
    losses integer DEFAULT 0,
    status public.contestant_status DEFAULT 'Alive'::public.contestant_status,
    dictator_id uuid,
    released boolean DEFAULT false,
    CONSTRAINT check_health CHECK (((health >= 0) AND (health <= 100))),
    CONSTRAINT contestant_agility_check CHECK (((agility >= 1) AND (agility <= 100))),
    CONSTRAINT contestant_health_check CHECK (((health >= 0) AND (health <= 100))),
    CONSTRAINT contestant_strength_check CHECK (((strength >= 1) AND (strength <= 100)))
);


--
-- Name: contestantitems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contestantitems (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contestant_id uuid NOT NULL,
    item_name character varying(255) NOT NULL,
    source character varying(10) NOT NULL,
    giver_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    CONSTRAINT contestantitems_source_check CHECK (((source)::text = ANY (ARRAY[('sponsor'::character varying)::text, ('dictator'::character varying)::text])))
);


--
-- Name: dictator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dictator (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    territory character varying(100) NOT NULL,
    loyalty_score integer DEFAULT 100,
    user_id uuid NOT NULL,
    failed_attempts integer DEFAULT 0,
    blocked boolean DEFAULT false NOT NULL,
    CONSTRAINT check_loyalty CHECK (((loyalty_score >= 0) AND (loyalty_score <= 100))),
    CONSTRAINT dictator_loyalty_score_check CHECK (((loyalty_score >= 0) AND (loyalty_score <= 100)))
);


--
-- Name: dictator_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dictator_inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dictator_id uuid NOT NULL,
    item_name character varying(100) NOT NULL,
    category character varying(20) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    CONSTRAINT dictator_inventory_category_check CHECK (((category)::text = ANY (ARRAY[('weapon'::character varying)::text, ('buff'::character varying)::text]))),
    CONSTRAINT dictator_inventory_quantity_check CHECK ((quantity >= 0))
);


--
-- Name: event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    rules text,
    organizer_id uuid NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone
);


--
-- Name: eventbattle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventbattle (
    event_id uuid NOT NULL,
    battle_id uuid NOT NULL
);


--
-- Name: sponsor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name character varying(100) NOT NULL,
    preferred_fighter uuid,
    loyalty_score integer DEFAULT 100,
    user_id uuid NOT NULL,
    failed_attempts integer DEFAULT 0,
    CONSTRAINT sponsor_fidelity_score_check CHECK (((loyalty_score >= 0) AND (loyalty_score <= 100)))
);


--
-- Name: sponsorinventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsorinventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sponsor_id uuid NOT NULL,
    item_name character varying(100) NOT NULL,
    quantity integer NOT NULL,
    category character varying(10),
    CONSTRAINT sponsorinventory_category_check CHECK (((category)::text = ANY (ARRAY[('weapon'::character varying)::text, ('buff'::character varying)::text]))),
    CONSTRAINT sponsorinventory_quantity_check CHECK ((quantity >= 0))
);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_username_key" UNIQUE (username);


--
-- Name: battle battle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.battle
    ADD CONSTRAINT battle_pkey PRIMARY KEY (id);


--
-- Name: bet bet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT bet_pkey PRIMARY KEY (id);


--
-- Name: blackmarkettransaction blackmarkettransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blackmarkettransaction
    ADD CONSTRAINT blackmarkettransaction_pkey PRIMARY KEY (id);


--
-- Name: buff buff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buff
    ADD CONSTRAINT buff_pkey PRIMARY KEY (id);


--
-- Name: contestant contestant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contestant
    ADD CONSTRAINT contestant_pkey PRIMARY KEY (id);


--
-- Name: contestantitems contestantitems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contestantitems
    ADD CONSTRAINT contestantitems_pkey PRIMARY KEY (id);


--
-- Name: dictator_inventory dictator_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator_inventory
    ADD CONSTRAINT dictator_inventory_pkey PRIMARY KEY (id);


--
-- Name: dictator_inventory dictator_inventory_unique_dictator_item; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator_inventory
    ADD CONSTRAINT dictator_inventory_unique_dictator_item UNIQUE (dictator_id, item_name);


--
-- Name: dictator dictator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator
    ADD CONSTRAINT dictator_pkey PRIMARY KEY (id);


--
-- Name: dictator dictator_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator
    ADD CONSTRAINT dictator_user_id_key UNIQUE (user_id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: eventbattle eventbattle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventbattle
    ADD CONSTRAINT eventbattle_pkey PRIMARY KEY (event_id, battle_id);


--
-- Name: sponsor sponsor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsor
    ADD CONSTRAINT sponsor_pkey PRIMARY KEY (id);


--
-- Name: sponsor sponsor_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsor
    ADD CONSTRAINT sponsor_user_id_key UNIQUE (user_id);


--
-- Name: sponsorinventory sponsorinventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorinventory
    ADD CONSTRAINT sponsorinventory_pkey PRIMARY KEY (id);


--
-- Name: sponsor unique_company_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsor
    ADD CONSTRAINT unique_company_name UNIQUE (company_name);


--
-- Name: dictator unique_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: dictator unique_territory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator
    ADD CONSTRAINT unique_territory UNIQUE (territory);


--
-- Name: idx_battle_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_battle_dates ON public.battle USING btree (date);


--
-- Name: idx_battle_winner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_battle_winner ON public.battle USING btree (winner_id);


--
-- Name: idx_contestant_stats; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contestant_stats ON public.contestant USING btree (strength, agility, health);


--
-- Name: idx_event_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_dates ON public.event USING btree (start_date, end_date);


--
-- Name: idx_sponsor_preferred; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sponsor_preferred ON public.sponsor USING btree (preferred_fighter);


--
-- Name: battle battle_casualty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.battle
    ADD CONSTRAINT battle_casualty_id_fkey FOREIGN KEY (casualty_id) REFERENCES public.contestant(id);


--
-- Name: battle battle_contestant_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.battle
    ADD CONSTRAINT battle_contestant_1_fkey FOREIGN KEY (contestant_1) REFERENCES public.contestant(id);


--
-- Name: battle battle_contestant_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.battle
    ADD CONSTRAINT battle_contestant_2_fkey FOREIGN KEY (contestant_2) REFERENCES public.contestant(id);


--
-- Name: battle battle_dictator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.battle
    ADD CONSTRAINT battle_dictator_id_fkey FOREIGN KEY (dictator_id) REFERENCES public.dictator(id);


--
-- Name: battle battle_winner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.battle
    ADD CONSTRAINT battle_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.contestant(id);


--
-- Name: bet bet_battle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT bet_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES public.battle(id) ON DELETE CASCADE;


--
-- Name: bet bet_predicted_winner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT bet_predicted_winner_fkey FOREIGN KEY (predicted_winner) REFERENCES public.contestant(id) ON DELETE SET NULL;


--
-- Name: buff buff_contestant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buff
    ADD CONSTRAINT buff_contestant_id_fkey FOREIGN KEY (contestant_id) REFERENCES public.contestant(id) ON DELETE CASCADE;


--
-- Name: buff buff_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buff
    ADD CONSTRAINT buff_source_id_fkey FOREIGN KEY (source_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: contestant contestant_dictator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contestant
    ADD CONSTRAINT contestant_dictator_id_fkey FOREIGN KEY (dictator_id) REFERENCES public.dictator(id) ON DELETE CASCADE;


--
-- Name: contestantitems contestantitems_contestant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contestantitems
    ADD CONSTRAINT contestantitems_contestant_id_fkey FOREIGN KEY (contestant_id) REFERENCES public.contestant(id) ON DELETE CASCADE;


--
-- Name: dictator_inventory dictator_inventory_dictator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator_inventory
    ADD CONSTRAINT dictator_inventory_dictator_id_fkey FOREIGN KEY (dictator_id) REFERENCES public.dictator(id) ON DELETE CASCADE;


--
-- Name: dictator dictator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dictator
    ADD CONSTRAINT dictator_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: event event_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.dictator(id) ON DELETE CASCADE;


--
-- Name: eventbattle eventbattle_battle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventbattle
    ADD CONSTRAINT eventbattle_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES public.battle(id) ON DELETE CASCADE;


--
-- Name: eventbattle eventbattle_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventbattle
    ADD CONSTRAINT eventbattle_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE;


--
-- Name: bet fk_bet_battle; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT fk_bet_battle FOREIGN KEY (battle_id) REFERENCES public.battle(id) ON DELETE CASCADE;


--
-- Name: bet fk_bet_predicted_winner; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT fk_bet_predicted_winner FOREIGN KEY (predicted_winner) REFERENCES public.contestant(id) ON DELETE SET NULL;


--
-- Name: blackmarkettransaction fk_blackmarket_buyer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blackmarkettransaction
    ADD CONSTRAINT fk_blackmarket_buyer FOREIGN KEY (buyer_id) REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: blackmarkettransaction fk_blackmarket_seller; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blackmarkettransaction
    ADD CONSTRAINT fk_blackmarket_seller FOREIGN KEY (seller_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: sponsor sponsor_preferred_fighter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsor
    ADD CONSTRAINT sponsor_preferred_fighter_fkey FOREIGN KEY (preferred_fighter) REFERENCES public.contestant(id) ON DELETE SET NULL;


--
-- Name: sponsor sponsor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsor
    ADD CONSTRAINT sponsor_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: sponsorinventory sponsorinventory_sponsor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorinventory
    ADD CONSTRAINT sponsorinventory_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsor(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


