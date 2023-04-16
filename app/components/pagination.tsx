import React from "react";
import { Button, Flex, HStack, Icon } from "@chakra-ui/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import type { Paginator } from "~/utils/pagination";
import { Link } from "@remix-run/react";

export default function Pagination(paginator: Paginator) {
  return (
    <Flex p={2} w="full" alignItems="center" justifyContent="center">
      <HStack>
        {paginator.previousLink.isActive ? 
          <Button as={Link} size={"sm"} to={paginator.previousLink.href}><Icon as={IoIosArrowBack} boxSize={4} /></Button>
         : <Button size={"sm"} isDisabled><Icon as={IoIosArrowBack} boxSize={4} /></Button> }

        {paginator.pageNumbers.map((pageNum) => {
          return (
            <Button as={Link} key={pageNum.value} size={"sm"} to={pageNum.href} isActive={pageNum.isActive}>
              {pageNum.value}
            </Button>
          )
        })}

        {paginator.nextLink.isActive ? 
          <Button as={Link} size={"sm"} to={paginator.nextLink.href}><Icon as={IoIosArrowForward} boxSize={4} /></Button>        
        : <Button size={"sm"} isDisabled><Icon as={IoIosArrowForward} boxSize={4} /></Button> }
      </HStack>
    </Flex>
  );
};
