create database FamilyTree
use FamilyTree

-- ����� ���� �����
CREATE TABLE People (
    Person_Id INT IDENTITY(1,1) PRIMARY KEY,
    Personal_Name VARCHAR(255),
    Family_Name VARCHAR(255),
    Gender VARCHAR(10),
    Father_Id INT,
    Mother_Id INT,
    Spouse_Id INT,
    CONSTRAINT CK_SpouseNotSelf CHECK (Spouse_Id <> Person_Id)
);

-- ����� ������ ����� ������
INSERT INTO People (Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id)
VALUES
    ('�����', '���', '���', NULL, NULL, 2),
    ('������', '���', '����', NULL, NULL, NULL),
    ('�����', '���', '����', 1, 2, 4),
    ('����', '���', '���', NULL, 20, NULL),
    ('����', '���', '���', 1, 2, 6),
    ('����', '���', '����', NULL, NULL, 5),
    ('���', '���', '����', 1, 2, NULL),
	('����', '���', '���', 1, 2, 10);

-- ���� ���� ������
select *
from [dbo].[People]

-- ����� ���� ���� �����
CREATE TABLE Family_Relations (
    Person_Id INT,
    Relative_Id INT,
    Connection_Type VARCHAR(10),
    PRIMARY KEY (Person_Id, Relative_Id, Connection_Type),
    FOREIGN KEY (Person_Id) REFERENCES People(Person_Id),
    CHECK (Connection_Type IN ('��', '��', '��', '����', '��', '��', '�� ���', '�� ���', '�� ����'))
);

-- ����� �������� ������� ������ ����� ���� ����� �� �� ������� ����� ������
create PROCEDURE InsertFamilyRelations
AS
BEGIN
    -- ����� ����
    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT Person_Id, Father_Id, '��' FROM People WHERE Father_Id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM Family_Relations fr WHERE fr.Person_Id = Person_Id AND fr.Relative_Id = Father_Id AND fr.Connection_Type = '��');

    -- ����� ������
    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT Person_Id, Mother_Id, '��' FROM People WHERE Mother_Id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM Family_Relations fr WHERE fr.Person_Id = Person_Id AND fr.Relative_Id = Mother_Id AND fr.Connection_Type = '��');

    -- ����� ��� ���
    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT p1.Person_Id, p1.Spouse_Id, CASE WHEN p2.Gender = '���' THEN '�� ���' WHEN p2.Gender = '����' THEN '�� ���' ELSE '�� ����' END
    FROM People p1
    LEFT JOIN People p2 ON p1.Spouse_Id = p2.Person_Id
    WHERE p1.Spouse_Id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM Family_Relations fr WHERE fr.Person_Id = p1.Person_Id AND fr.Relative_Id = p1.Spouse_Id);

    -- ����� �����
    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT p1.Person_Id, p2.Person_Id, CASE WHEN p2.Gender = '���' THEN '��' WHEN p2.Gender = '����' THEN '��' ELSE '�� ����' END
    FROM People p1
    LEFT JOIN People p2 ON (p1.Person_Id = p2.Father_Id OR p1.Person_Id = p2.Mother_Id)
    WHERE p1.Person_Id IN (SELECT Father_Id FROM People UNION SELECT Mother_Id FROM People)
    AND NOT EXISTS (SELECT 1 FROM Family_Relations fr WHERE fr.Person_Id = p1.Person_Id AND fr.Relative_Id = p2.Person_Id AND fr.Connection_Type IN ('��', '��', '�� ����'));

    -- ����� ���� ������
    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT p1.Person_Id, p2.Person_Id, CASE WHEN p2.Gender = '���' THEN '��' WHEN p2.Gender = '����' THEN '����' ELSE '�� ����' END
    FROM People p1
    LEFT JOIN People p2 ON (p1.Father_Id = p2.Father_Id OR p1.Mother_Id = p2.Mother_Id)
    WHERE p1.Person_Id <> p2.Person_Id
    AND NOT EXISTS (SELECT 1 FROM Family_Relations fr WHERE fr.Person_Id = p1.Person_Id AND fr.Relative_Id = p2.Person_Id AND fr.Connection_Type IN ('��', '����', '�� ����'));
END;

-- ���� ��������� ����� ������ ����� �����
EXEC InsertFamilyRelations;

-- ���� ���� ����� ����� (����� ����� ������ ��� ����� �����)
SELECT
	p1.Person_Id,
    p1.Personal_Name AS Person_Name,
	fr.Relative_Id,
    p2.Personal_Name AS Relative_Name,
    fr.Connection_Type
FROM
    Family_Relations fr
LEFT JOIN
    People p1 ON fr.Person_Id = p1.Person_Id
LEFT JOIN
    People p2 ON fr.Relative_Id = p2.Person_Id;

-- ����� ��� ��� ����� ���� �����
INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
SELECT p2.Person_Id, p1.Person_Id, CASE WHEN p1.Gender = '���' THEN '�� ���' ELSE '�� ���' END
FROM People p1
JOIN People p2 ON p1.Spouse_Id = p2.Person_Id
WHERE p1.Spouse_Id IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM Family_Relations fr
    WHERE fr.Person_Id = p2.Person_Id AND fr.Relative_Id = p1.Person_Id
);

--- ���� �� ����� �� ����� ��� ���� �����

--WITH ParentIDs AS (
--    SELECT Father_Id AS Parent_Id FROM People WHERE Father_Id IS NOT NULL
--    UNION
--    SELECT Mother_Id FROM People WHERE Mother_Id IS NOT NULL
--)
--SELECT
--    p.Parent_Id,
--    child_data.Person_Id AS Child_Person_Id,
--    CASE
--        WHEN child_data.Gender = '���' THEN '��'
--        WHEN child_data.Gender = '����' THEN '��'
--        ELSE '�� ����'
--    END AS Child_Relationship
--FROM
--    ParentIDs p
--LEFT JOIN
--    People parent_data ON p.Parent_Id = parent_data.Person_Id
--LEFT JOIN
--    People child_data ON p.Parent_Id = child_data.Father_Id OR p.Parent_Id = child_data.Mother_Id;

