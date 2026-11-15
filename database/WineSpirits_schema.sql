/* =========================================================
   Wine & Spirits - Veritabanı Şeması (SQL Server)
   Sadece tablo yapısı içerir, veri içermez.
   Kullanım: SSMS'te yeni bir sorgu penceresinde çalıştırın.
   ========================================================= */

IF DB_ID(N'WineSpirits') IS NULL
    CREATE DATABASE [WineSpirits];
GO
USE [WineSpirits];
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* ---------- Tablolar ---------- */

CREATE TABLE [dbo].[__EFMigrationsHistory](
    [MigrationId]    [nvarchar](150) NOT NULL,
    [ProductVersion] [nvarchar](32)  NOT NULL,
    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId] ASC)
);
GO

CREATE TABLE [dbo].[AppUser](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Username]    [nvarchar](50)  NOT NULL,
    [Password]    [nvarchar](100) NOT NULL,
    [FullName]    [nvarchar](100) NULL,
    [Position]    [nvarchar](50)  NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    [IsActive]    [bit]      NOT NULL,
    [Role]        [int]      NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    UNIQUE NONCLUSTERED ([Username] ASC)
);
GO

CREATE TABLE [dbo].[Country](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Name]        [nvarchar](50) NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_Country] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[Customer](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Name]        [nvarchar](50)  NOT NULL,
    [Lastname]    [nvarchar](50)  NOT NULL,
    [Email]       [nvarchar](50)  NOT NULL,
    [Phone]       [nvarchar](15)  NOT NULL,
    [Adress]      [nvarchar](500) NOT NULL,
    [TaxOffice]   [nvarchar](100) NOT NULL,
    [TaxNumber]   [nvarchar](20)  NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    [IsActive]    [bit]      NOT NULL,
    CONSTRAINT [PK_Customer] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[Order](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [CustomerId]  [uniqueidentifier] NOT NULL,
    [OrderDate]   [datetime] NOT NULL,
    [Description] [nvarchar](500) NOT NULL,
    [WarehouseId] [uniqueidentifier] NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    [IsActive]    [bit]      NOT NULL,
    CONSTRAINT [PK_Order] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[OrderDetail](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [OrderId]     [uniqueidentifier] NOT NULL,
    [ProductId]   [uniqueidentifier] NOT NULL,
    [Quantity]    [int] NOT NULL,
    [UnitPrice]   [decimal](18, 2) NOT NULL,
    [TotalPrice]  [decimal](18, 2) NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_OrderDetail] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[Product](
    [Id]                  [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [ProductCategoryId]   [uniqueidentifier] NOT NULL,
    [CountryId]           [uniqueidentifier] NOT NULL,
    [Year]                [int] NULL,
    [UnitId]              [uniqueidentifier] NOT NULL,
    [Price]               [decimal](18, 2) NOT NULL,
    [SupplierId]          [uniqueidentifier] NOT NULL,
    [ProductDefinitionId] [uniqueidentifier] NOT NULL,
    [StockQuantity]       [int] NOT NULL,
    [IsDeleted]           [bit]      NOT NULL,
    [CreatedDate]         [datetime] NOT NULL,
    [IsActive]            [bit]      NOT NULL,
    [WarehouseId]         [uniqueidentifier] NULL,
    CONSTRAINT [PK_Product] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[ProductCategory](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Name]        [nvarchar](100) NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_ProductCategory] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[ProductDefinition](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Name]        [nvarchar](255) NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[StockMovement](
    [Id]           [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [ProductId]    [uniqueidentifier] NOT NULL,
    [MovementType] [nvarchar](20)  NOT NULL,
    [Quantity]     [int] NOT NULL,
    [Date]         [datetime] NOT NULL,
    [Description]  [nvarchar](500) NULL,
    [IsDeleted]    [bit]      NOT NULL,
    [CreatedDate]  [datetime] NOT NULL,
    CONSTRAINT [PK_StockMovement] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[Supplier](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Name]        [nvarchar](500) NOT NULL,
    [Phone]       [nvarchar](15)  NOT NULL,
    [Email]       [nvarchar](50)  NOT NULL,
    [CountryId]   [uniqueidentifier] NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    [IsActive]    [bit]      NOT NULL,
    [WarehouseId] [uniqueidentifier] NULL,
    CONSTRAINT [PK_Supplier] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[SupportRequest](
    [Id]            [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [RequestType]   [nvarchar](50)  NOT NULL,
    [SuggestedName] [nvarchar](255) NOT NULL,
    [Status]        [nvarchar](20)  NULL,
    [CreatedDate]   [datetime] NULL,
    [IsDeleted]     [bit] NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[Unit](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Name]        [nvarchar](50) NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_Unit] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE TABLE [dbo].[WareHouse](
    [Id]          [uniqueidentifier] ROWGUIDCOL NOT NULL,
    [Name]        [nvarchar](500) NOT NULL,
    [Location]    [nvarchar](500) NOT NULL,
    [IsDeleted]   [bit]      NOT NULL,
    [CreatedDate] [datetime] NOT NULL,
    [IsActive]    [bit]      NOT NULL,
    CONSTRAINT [PK_WareHouse] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

/* ---------- Varsayılan değerler ---------- */

ALTER TABLE [dbo].[AppUser] ADD DEFAULT (newid())   FOR [Id];
ALTER TABLE [dbo].[AppUser] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[AppUser] ADD DEFAULT (getdate()) FOR [CreatedDate];
ALTER TABLE [dbo].[AppUser] ADD DEFAULT ((1))       FOR [IsActive];
ALTER TABLE [dbo].[AppUser] ADD DEFAULT ((3))       FOR [Role];
GO
ALTER TABLE [dbo].[Country] ADD CONSTRAINT [DF_Country_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[Country] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[Country] ADD DEFAULT (getdate()) FOR [CreatedDate];
GO
ALTER TABLE [dbo].[Customer] ADD CONSTRAINT [DF_Customer_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[Customer] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[Customer] ADD DEFAULT (getdate()) FOR [CreatedDate];
ALTER TABLE [dbo].[Customer] ADD CONSTRAINT [DF_Customer_IsActive] DEFAULT ((1)) FOR [IsActive];
GO
ALTER TABLE [dbo].[Order] ADD CONSTRAINT [DF_Order_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[Order] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[Order] ADD DEFAULT (getdate()) FOR [CreatedDate];
ALTER TABLE [dbo].[Order] ADD CONSTRAINT [DF_Order_IsActive] DEFAULT ((1)) FOR [IsActive];
GO
ALTER TABLE [dbo].[OrderDetail] ADD CONSTRAINT [DF_OrderDetail_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[OrderDetail] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[OrderDetail] ADD DEFAULT (getdate()) FOR [CreatedDate];
GO
ALTER TABLE [dbo].[Product] ADD CONSTRAINT [DF_Product_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[Product] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[Product] ADD DEFAULT (getdate()) FOR [CreatedDate];
ALTER TABLE [dbo].[Product] ADD CONSTRAINT [DF_Product_IsActive] DEFAULT ((1)) FOR [IsActive];
GO
ALTER TABLE [dbo].[ProductCategory] ADD CONSTRAINT [DF_ProductCategory_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[ProductCategory] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[ProductCategory] ADD DEFAULT (getdate()) FOR [CreatedDate];
GO
ALTER TABLE [dbo].[ProductDefinition] ADD DEFAULT (newid())   FOR [Id];
ALTER TABLE [dbo].[ProductDefinition] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[ProductDefinition] ADD DEFAULT (getdate()) FOR [CreatedDate];
GO
ALTER TABLE [dbo].[StockMovement] ADD DEFAULT (newid())   FOR [Id];
ALTER TABLE [dbo].[StockMovement] ADD DEFAULT (getdate()) FOR [Date];
ALTER TABLE [dbo].[StockMovement] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[StockMovement] ADD DEFAULT (getdate()) FOR [CreatedDate];
GO
ALTER TABLE [dbo].[Supplier] ADD CONSTRAINT [DF_Supplier_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[Supplier] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[Supplier] ADD DEFAULT (getdate()) FOR [CreatedDate];
ALTER TABLE [dbo].[Supplier] ADD DEFAULT ((1))       FOR [IsActive];
GO
ALTER TABLE [dbo].[SupportRequest] ADD DEFAULT (newid())   FOR [Id];
ALTER TABLE [dbo].[SupportRequest] ADD DEFAULT ('Pending') FOR [Status];
ALTER TABLE [dbo].[SupportRequest] ADD DEFAULT (getdate()) FOR [CreatedDate];
ALTER TABLE [dbo].[SupportRequest] ADD DEFAULT ((0))       FOR [IsDeleted];
GO
ALTER TABLE [dbo].[Unit] ADD CONSTRAINT [DF_Unit_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[Unit] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[Unit] ADD DEFAULT (getdate()) FOR [CreatedDate];
GO
ALTER TABLE [dbo].[WareHouse] ADD CONSTRAINT [DF_WareHouse_Id] DEFAULT (newid()) FOR [Id];
ALTER TABLE [dbo].[WareHouse] ADD DEFAULT ((0))       FOR [IsDeleted];
ALTER TABLE [dbo].[WareHouse] ADD DEFAULT (getdate()) FOR [CreatedDate];
ALTER TABLE [dbo].[WareHouse] ADD DEFAULT ((1))       FOR [IsActive];
GO

/* ---------- İlişkiler (Foreign Key) ---------- */

ALTER TABLE [dbo].[OrderDetail] WITH CHECK ADD CONSTRAINT [FK_OrderDetail_Order]
    FOREIGN KEY([OrderId]) REFERENCES [dbo].[Order] ([Id]);
ALTER TABLE [dbo].[OrderDetail] WITH CHECK ADD CONSTRAINT [FK_OrderDetail_Product]
    FOREIGN KEY([ProductId]) REFERENCES [dbo].[Product] ([Id]);
GO
ALTER TABLE [dbo].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_Country]
    FOREIGN KEY([CountryId]) REFERENCES [dbo].[Country] ([Id]);
ALTER TABLE [dbo].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_ProductCategory]
    FOREIGN KEY([ProductCategoryId]) REFERENCES [dbo].[ProductCategory] ([Id]);
ALTER TABLE [dbo].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_ProductDefinitions]
    FOREIGN KEY([ProductDefinitionId]) REFERENCES [dbo].[ProductDefinition] ([Id]);
ALTER TABLE [dbo].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_Supplier]
    FOREIGN KEY([SupplierId]) REFERENCES [dbo].[Supplier] ([Id]);
ALTER TABLE [dbo].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_Unit]
    FOREIGN KEY([UnitId]) REFERENCES [dbo].[Unit] ([Id]);
GO
ALTER TABLE [dbo].[StockMovement] WITH CHECK ADD CONSTRAINT [FK_StockMovement_Product]
    FOREIGN KEY([ProductId]) REFERENCES [dbo].[Product] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Supplier] WITH CHECK ADD CONSTRAINT [FK_Supplier_Country]
    FOREIGN KEY([CountryId]) REFERENCES [dbo].[Country] ([Id]);
GO
